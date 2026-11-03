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
