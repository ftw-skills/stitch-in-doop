# From Kiln to Shelf storyboard acceptance

[SHOT-LIST.md](SHOT-LIST.md) specifies two 16:9 shots over six seconds. Both shots are editable in Doop and share the ceramics imagery and treatment described in [DESIGN.md](DESIGN.md).

| Check | Observed result |
| --- | --- |
| Local | 157 browser checks passed at 960 × 540 per shot. The checks covered title position and font, two images per shot, containment and primary image height. |
| Composition | Both shots retain the title lane and object continuity. The kettle becomes the dominant image in the second shot. All type and image boxes fit the stage. |
| Native Doop | Two Pages with six Frames total. Each has a Style Card, a ceramic Asset Card and an editable shot Frame. Both native entry IDs matched the shot manifest and both photos loaded in each shot. |
| Repeat sync | Zero operations on the published canvas. |

[Doop canvas](http://localhost:4400/c/uXKJGXDgG-) · [Native evidence](evidence/doop-acceptance.json)

From the skill root, after [installing the dependencies](../../references/workflow.md), use a writable copy of this example.

```text
node scripts/project-workflow.mjs check "<EXAMPLE_DIR>"
node scripts/accept-project.mjs "<EXAMPLE_DIR>"
```

Follow [Doop delivery](../../references/doop.md) to publish and verify each shot entry. The Doop deliverable consists of editable still compositions. Motion, audio and transitions are specified as production notes in the shot list.
