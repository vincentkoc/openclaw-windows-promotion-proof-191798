import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";

const repository = "vincentkoc/openclaw-windows-promotion-proof-191798";
const releaseTag = "v2099.1.1-beta.6";
const originalExecFileSync = childProcess.execFileSync;
let failureInjected = false;

childProcess.execFileSync = function (file, args, options) {
  // Keep real subprocess behavior; inject only after the first upload succeeds.
  const result = Reflect.apply(originalExecFileSync, this, arguments);
  if (
    failureInjected ||
    process.env.GITHUB_RUN_ATTEMPT !== "1" ||
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

  const env = process.env;
  if (
    env.GITHUB_REPOSITORY !== repository ||
    env.RELEASE_TAG !== releaseTag ||
    !/^[a-f0-9]{40}$/u.test(env.GITHUB_WORKFLOW_SHA ?? "") ||
    !/^[1-9][0-9]*$/u.test(env.GITHUB_RUN_ID ?? "")
  ) {
    throw new Error("Invalid isolated F fixture identity; proof is invalid.");
  }
  failureInjected = true;
  console.log(
    "WINDOWS_PROOF_PARTIAL_UPLOAD " +
      JSON.stringify({
        runId: env.GITHUB_RUN_ID,
        attempt: env.GITHUB_RUN_ATTEMPT,
        fixtureSha: env.GITHUB_WORKFLOW_SHA,
        completedAt: new Date().toISOString(),
      }),
  );
  throw new Error("WINDOWS_PROOF_F_INTENTIONAL_FAILURE_AFTER_ARM64_UPLOAD");
};
syncBuiltinESMExports();
