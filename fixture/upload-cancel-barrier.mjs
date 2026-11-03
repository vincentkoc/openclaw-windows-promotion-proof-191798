import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";

const repository = "vincentkoc/openclaw-windows-promotion-proof-191798";
const releaseTag = "v2099.1.1-beta.2";
const originalExecFileSync = childProcess.execFileSync;
let barrierUsed = false;

childProcess.execFileSync = function (file, args, options) {
  // The real upload must finish successfully before instrumentation starts.
  // Original subprocess arguments, options, return values and errors pass through.
  const result = Reflect.apply(originalExecFileSync, this, arguments);
  if (
    barrierUsed ||
    file !== "gh" ||
    !Array.isArray(args) ||
    args[0] !== "release" ||
    args[1] !== "upload" ||
    args[2] !== releaseTag ||
    typeof args[3] !== "string" ||
    basename(args[3]) !== "OpenClawCompanion-Setup-arm64.exe" ||
    args[args.indexOf("--repo") + 1] !== repository
  ) {
    return result;
  }

  barrierUsed = true;
  const env = process.env;
  const sha = env.GITHUB_WORKFLOW_SHA;
  const runId = env.GITHUB_RUN_ID;
  const attempt = env.GITHUB_RUN_ATTEMPT;
  if (
    env.GITHUB_REPOSITORY !== repository ||
    env.RELEASE_TAG !== releaseTag ||
    !/^[a-f0-9]{40}$/u.test(sha ?? "") ||
    !/^[1-9][0-9]*$/u.test(runId ?? "") ||
    attempt !== "1"
  ) {
    throw new Error("Invalid isolated D fixture identity; proof is invalid.");
  }

  const markerRef = `refs/heads/proof-barrier/${runId}-${attempt}`;
  originalExecFileSync(
    "gh",
    [
      "api",
      `repos/${repository}/git/refs`,
      "--method",
      "POST",
      "-f",
      `ref=${markerRef}`,
      "-f",
      `sha=${sha}`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 },
  );
  const started = Date.now();
  console.log(
    "WINDOWS_PROOF_BARRIER " +
      JSON.stringify({
        runId,
        attempt,
        fixtureSha: sha,
        markerRef,
        startedAt: new Date(started).toISOString(),
        deadline: new Date(started + 90_000).toISOString(),
      }),
  );
  // Outside the upload subprocess timeout. Without real GitHub cancellation,
  // this finite pause returns the original success and publication continues.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 90_000);
  console.log("WINDOWS_PROOF_BARRIER_RELEASED " + new Date().toISOString());
  return result;
};
syncBuiltinESMExports();
