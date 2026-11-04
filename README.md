# Windows promotion integration proof

Isolated sandbox integration for https://github.com/openclaw/openclaw/pull/191798 at commit `7f5106a09bc7bf7a39f751433c00d0817fd691ba`.

This independent repository contains a minimal public source fixture, not OpenClaw history. All release writes target this sandbox only. The parent is a synthetic publisher with a task-only SSH signing trust root. Its real environment approval creates the original release receipt and attests a Windows projection with `source: null`. The child uses explicit direct release recovery for late attachment.

The original Windows workflow and guards are retained, with one deliberate post-upload failure on attempt 1. Rerunning failed jobs tests reuse of the successful validation artifact and the current-attempt protected writer. This proves post-upload retry, not interruption between uploads, a byte-identical production release, or the full production publisher. Native Authenticode checks run before upload; target readback verifies exact asset names, manifest and checksums, not a second Authenticode invocation.

Source installers: public `openclaw/openclaw-windows-node` release `v2026.9.8-1`.

- arm64: `sha256:a4b573cbff9f5134848c54d4cc7486bf1e23d245153b0bd4d004227058ae92f8`
- x64: `sha256:068c059da30dc7602f4abed00c5789ae3207bd27d15b350ca2e3256dd8af274d`

The synthetic release tag is `v2099.1.1-beta.1`, a non-latest prerelease. No npm publish occurs. Only the public signing key is included; the ephemeral private key is never published.

## Source provenance

| Repo-relative source file | Source SHA-256 | Original fixture SHA-256 |
| --- | --- | --- |
| `scripts/windows-release-promotion.mjs` | `d2df946ba2dfe81f8707f35c8e4c313b8f04465796d669a523dbe9836824cf36` | `d2df946ba2dfe81f8707f35c8e4c313b8f04465796d669a523dbe9836824cf36` |
| `scripts/release-approval-receipt.mjs` | `0cd525d0007d118cb9be9468929f9bbbe8edcbdb17110319520364ecccc2072f` | `71f8d67951920e928a2a2334ca80b1a5f487c6595c5001ebe55f1f7e6a89476e` |
| `scripts/release-tooling-identity.mjs` | `24ea8464f4e90c1c1b895c2e20828b700c33b89faa75d5a4505b46b1e9cbcf5b` | `24ea8464f4e90c1c1b895c2e20828b700c33b89faa75d5a4505b46b1e9cbcf5b` |
| `scripts/lib/actions-artifact-archive.mjs` | `4dd54803c889b984c551a57513210a7a07d21f9da93bc163b61b0ae59ffb782e` | `4dd54803c889b984c551a57513210a7a07d21f9da93bc163b61b0ae59ffb782e` |
| `scripts/lib/record-shared.mjs` | `f7485a3b947b5cac2192369fbbd9a6c1e26493b734978609b5941b6dd5cbcc84` | `f7485a3b947b5cac2192369fbbd9a6c1e26493b734978609b5941b6dd5cbcc84` |
| `LICENSE` | `9efd316ecf1c4c60f6fd5d26433142fff2b6794d7d328e9bc6179b29bf9c82a4` | `9efd316ecf1c4c60f6fd5d26433142fff2b6794d7d328e9bc6179b29bf9c82a4` |
| `.github/workflows/windows-node-release.yml` | `a6e78fcf478b8391ef6c11948afc0378114a32b16d9fd46538ea816e845336a7` | `2bf4486d2cba6f99d80ae1bb1179e9849d20d2e79049a14f6629a610ceb7d0ce` |

## Exact source adaptations

```diff
--- source/scripts/release-approval-receipt.mjs
+++ fixture/scripts/release-approval-receipt.mjs
@@ -14,7 +14,7 @@
   validateReleasePublishParentRun,
 } from "./release-tooling-identity.mjs";

-const REPOSITORY = "openclaw/openclaw";
+const REPOSITORY = "vincentkoc/openclaw-windows-promotion-proof-191798";
 const PARENT_WORKFLOW = ".github/workflows/openclaw-release-publish.yml";
 const PARENT_APPROVAL_JOB = "Publish plugins, then OpenClaw";
 const PARENT_RECEIPT_STEP = "Write release approval receipt";

--- source/.github/workflows/windows-node-release.yml
+++ fixture/.github/workflows/windows-node-release.yml
@@ -308,6 +308,12 @@
         run: |
           node scripts/windows-release-promotion.mjs publish --approval "$env:RUNNER_TEMP/windows-release-approval/approval.json" --assets dist
           if ($LASTEXITCODE -ne 0) { throw "Windows release publication failed." }
+
+      - name: Sandbox proof intentional post-upload failure
+        if: ${{ github.run_attempt == 1 }}
+        shell: pwsh
+        run: |
+          throw "Sandbox proof: all three uploads completed; intentionally fail attempt one before readback."

       - name: Verify promoted release asset contract
         shell: pwsh
```

## Admitted-writer cancellation fixture (D)

This separate fixture extends original commit `3ab64ad3e633de600712037b2cbbfa832900733e`. The original `main`, signed tag `v2099.1.1-beta.1`, and its three published assets remain unchanged. The five production scripts retain the original fixture hashes above, including the single repository-constant relocation. They also remain unchanged in source PR commit `edf691b4dbda17133fdc88b7cdd1b894404140d3`, which repairs only prepared-handoff test fixtures and their test-line allocation.

D uses a separate signed prerelease, `v2099.1.1-beta.2`, with a fresh public fixture signer. Both parent and child execute the same frozen `release-publish/<fixture-sha-prefix>-41636427241` tooling tag. The synthetic parent verifies this new signed tag, creates real receipts, and attests the Windows projection with `source: null`.

Only the Windows publication step loads `fixture/upload-cancel-barrier.mjs` through `NODE_OPTIONS`; its checkout includes the fixture directory. The preload forwards real subprocess calls unchanged. After the first successful real arm64 upload, it creates one public `proof-barrier/<child-run>-1` branch at the executing fixture SHA, logs UTC start and deadline, and pauses for 90 seconds outside the upload subprocess timeout. The pause then releases normally if GitHub has not cancelled the run. It does not fabricate API responses, approval, identity, or upload success.

The controller must observe the marker, the approved writer running, and exactly one complete arm64 asset with the approved size and digest before cancelling that exact child. Acceptance requires the writer's GitHub cancellation completion timestamp and observation of the terminal cancelled run before the logged deadline, with no second installer or manifest. The original positive assets must retain their IDs, sizes, and digests. This tests platform cancellation after admission and one completed write; it does not claim helper execution after termination, rollback, or interruption during an upload. A missed deadline, instrumentation error, or unexpected write invalidates the probe.

## Parent-attempt denial after the first upload (E)

This separate fixture extends D commit `ac17ae71a9a276ee2d9f9320cd10886202ef8ac6`. D remains valid evidence of GitHub platform cancellation after admission and a completed write. Because D kills a process paused between uploads, it would also prevent the next upload if the helper's between-upload authority checks were removed. D therefore does not independently prove that those checks reject changed authority. Observed cancellation propagation also does not establish instantaneous revocation.

E uses a separate signed candidate `v2099.1.1-beta.3`, a fresh public fixture signer, an empty non-latest prerelease, and its own immutable `release-publish/<fixture-sha-prefix>-41636427241` tooling tag. All five production scripts remain byte-identical to the original sandbox fixture and unchanged production sources at `edf691b4dbda17133fdc88b7cdd1b894404140d3`, with only the existing receipt repository-constant relocation. The preload and its publication-command-only scope are unchanged from D except for the candidate tag. The old six-line intentional post-upload failure step is removed.

After native validation and actual environment admission, the real first arm64 upload must complete. The controller must observe its exact size and digest, the current-SHA marker, and the approved writer running. It then reruns this case's original parent once and observes parent attempt 2 at the same SHA/ref before the logged 90-second deadline. Parent attempt 2 remains unapproved. The child is not cancelled: the finite pause must release normally, and the next production authority check must refuse with `release publish parent run runAttempt does not match the trusted tooling identity.` before another upload. Acceptance also requires the original receipt to have reached attestation validation, a failed rather than cancelled upload step, no timeout, and only the completed arm64 asset. Without the between-upload authority check, additional assets would invalidate this proof.

After evidence collection, only the new waiting parent attempt 2 is cancelled. The original positive release and D release, tags, assets, and marker remain unchanged. E covers denial only. Recovery from the resulting one-asset release is not exercised and remains a separate follow-up; neither D nor E proves interruption during a single asset upload or rollback.

## Partial-release recovery with retained approval (F)

F extends E commit `f821755e7f280ef5f2f07b04d4c23a7cf8461a4a` on a separate fixture branch. It uses signed candidate `v2099.1.1-beta.4`, a fresh public fixture signer, an empty non-latest prerelease, and its own immutable lightweight `release-publish/<fixture-sha-prefix>-41636427241` tooling tag. All five production scripts retain the original fixture hashes, including only the existing receipt repository-constant relocation; these production sources also remain unchanged at PR head `e5cef5ecab11e131e2b866543efb8d6924b206a7`. Original positive, D and E resources remain unchanged.

The publication-step-only preload retains its historical filename `fixture/upload-cancel-barrier.mjs`, but F replaces the pause and marker with a one-time failure after the first real arm64 upload returns successfully on child attempt 1. It forwards every real subprocess unchanged, preserves subprocess errors, and throws `WINDOWS_PROOF_F_INTENTIONAL_FAILURE_AFTER_ARM64_UPLOAD` only after the completed upload. Attempt 2 passes through normally. No API response, authority, signature, receipt, or upload result is fabricated.

The controller records the failed upload step, distinctive error, original validation artifact, and exactly one complete arm64 asset with its approved size and digest before retrying. It reruns only failed jobs once on the same child and fixture SHA, observes the renewed protected-writer approval, and requires the successful validation job to retain its original timestamps and artifact ID. Writer attempt 2 must download that original artifact, complete all three asset uploads, and pass the native target asset/manifest/checksum readback. Final installer API digests must match the source pins. The original publisher stays successful at attempt 1 throughout; it is never rerun or cancelled.

F proves recovery from a completed one-asset partial release with a still-valid original publisher approval. It does not prove interruption during an individual upload, atomic publication, rollback, instantaneous cancellation, or recovery with E's superseded approval. Native Authenticode remains a pre-upload validation; final target readback verifies names and checksums.

## Simplified production source: current E/F qualification

The historical cases above retain their original source identities. This separate fixture qualifies the simplified production source at OpenClaw PR commit `b18a8dea941961407189ce4f7ddf67bde03ba300`, tree `88b24def2e5278e2d8af149c01ebffe98430a8a5`. The original publisher ID/attempt and installer selection remain inputs; actual executing GitHub ref and workflow SHA bind the approval, while its attested target and signed tag determine the candidate. The existing current-parent verifier owns parent policy. Native read-only validation owns bytes, and the writer consumes the immutable artifact by exact ID with digest mismatch set to error. Attestation runs once per process; live authority remains checked before each upload.

Current E uses signed candidate `v2099.1.1-beta.5`, the unchanged finite E preload except for this candidate, a synthetic parent with real approval/receipts/attestations, and explicit source-null late attachment. After one real arm64 upload, the controller advances only this parent to attempt 2 before the finite pause expires. The pause must release normally and the real helper must deny the next upload with the exact parent runAttempt mismatch. The child is not cancelled on a passing path; only the waiting parent attempt 2 is cancelled after evidence.

The five production files below are copied from the new source, with only the receipt repository constant relocated. The Windows workflow is copied from that source with only sparse checkout of `fixture` and `NODE_OPTIONS` on the publication step. No old intentional post-upload failure step is present. Previous releases, refs, markers and assets remain unchanged. This is namespace-relocated integration with a synthetic publisher/signing trust root, not the complete production publisher. Uploads remain sequential and non-atomic; these cases do not prove individual-upload interruption, instantaneous revocation or rollback.

| Source path | Source SHA-256 | Fixture SHA-256 |
| --- | --- | --- |
| `scripts/windows-release-promotion.mjs` | `9e32a7e0d060953fa45a7b76d650e722535ebe0e98e7a279ddc3688351389fe3` | `9e32a7e0d060953fa45a7b76d650e722535ebe0e98e7a279ddc3688351389fe3` |
| `scripts/release-approval-receipt.mjs` | `0cd525d0007d118cb9be9468929f9bbbe8edcbdb17110319520364ecccc2072f` | `71f8d67951920e928a2a2334ca80b1a5f487c6595c5001ebe55f1f7e6a89476e` |
| `scripts/release-tooling-identity.mjs` | `24ea8464f4e90c1c1b895c2e20828b700c33b89faa75d5a4505b46b1e9cbcf5b` | `24ea8464f4e90c1c1b895c2e20828b700c33b89faa75d5a4505b46b1e9cbcf5b` |
| `scripts/lib/actions-artifact-archive.mjs` | `4dd54803c889b984c551a57513210a7a07d21f9da93bc163b61b0ae59ffb782e` | `4dd54803c889b984c551a57513210a7a07d21f9da93bc163b61b0ae59ffb782e` |
| `scripts/lib/record-shared.mjs` | `f7485a3b947b5cac2192369fbbd9a6c1e26493b734978609b5941b6dd5cbcc84` | `f7485a3b947b5cac2192369fbbd9a6c1e26493b734978609b5941b6dd5cbcc84` |

Source Windows workflow SHA-256: `b921cecac44eefd60fdf543d698ab5a7f409966bb38e599f30ae8eeb1e16addc`.

## Simplified source: partial-release retry (current F)

Current F extends fixture `e7a98da822b703bc76e1124f2446e7435ec4dfcd` without changing any of the five production files or the Windows workflow. It uses separate signed candidate `v2099.1.1-beta.6`, an empty non-latest prerelease and its own lightweight tooling tag. The same task-only public signer authorizes the synthetic candidate; the private key remains local and is removed after hosted verification.

The preload is the previously exercised F instrumentation with only the candidate changed. It forwards real subprocess calls and throws the distinctive failure only after the first successful arm64 upload on child attempt 1. There is no pause, marker or parent mutation. Before one failed-jobs-only retry, the controller records the one-asset inventory and original validation artifact ID, digest, created_at, expired=false and execution timestamps. Attempt 2 passes through normally, receives actual renewed writer approval, downloads that original artifact and must complete all three uploads and native target checksum readback. The original publisher remains successful at attempt 1.

Current E remains separate denial evidence with its superseded parent; F does not recover E or reuse its approval. Prior resources remain intact. This qualifies completed-one-asset recovery with valid original authority, not interruption during an individual upload, atomicity, rollback or instantaneous cancellation.
