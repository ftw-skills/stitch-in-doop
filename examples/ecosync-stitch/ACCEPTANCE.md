# EcoSync Stitch-source acceptance

This mobile sample follows a real Google Stitch project from [source inspection](SOURCE.md) through editable HTML, local checks, Doop and an extracted offline ZIP. The native entry route is Main Dashboard → Usage History → Automations → Main Dashboard.

| Check | Observed result |
| --- | --- |
| Source | Veridian Flow specimen and all three named screens read in Stitch. The supplied guide and reconstructed HTML are included. |
| Local | 77 browser checks passed at 390 × 844. |
| Native Doop | Six Frames matched layout and dimensions. HVAC changed from checked to unchecked, and all three clicks reached the expected Frame IDs. |
| Repeat sync | Zero operations on the published canvas. |
| Offline ZIP | The Chrome run from the extracted root replayed the switch and all three route clicks. No missing resources or external requests. |

[Doop canvas](http://localhost:4400/c/i0IQLYGiT8) · [Native evidence](evidence/doop-acceptance.json) · [Offline evidence](evidence/offline-acceptance.json) · [ZIP](ecosync-stitch.zip)

From the skill root, after [installing the dependencies](../../references/workflow.md), use a writable copy of this example.

```text
node scripts/project-workflow.mjs check "<EXAMPLE_DIR>"
node scripts/accept-project.mjs "<EXAMPLE_DIR>"
node "<EXAMPLE_DIR>/build-offline.mjs"
node scripts/offline-delivery.mjs "<EXAMPLE_DIR>"
```

Use [Doop delivery](../../references/doop.md) to publish to a new canvas, then open the native player and record actual clicks and their Frame IDs.
