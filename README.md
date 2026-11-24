# Stitch in Doop

An agent skill for turning a Google Stitch design or a confirmed `DESIGN.md` into editable Doop canvases. It generates Style and Asset Cards, checks authored previews, and supports publication and route verification. It also covers editable storyboard keyframes.

## Quick start

Install Node.js 22 or later, npm, and Google Chrome. From the repository root, install the locked dependencies and reproduce the sample in a new directory.

```sh
npm ci --prefix scripts
node scripts/reproduce-example.mjs ../harbor-atlas-run
node scripts/accept-project.mjs ../harbor-atlas-run
```

The sample uses platform fonts for exact checks. See [setup and project inputs](references/workflow.md) for details. For Doop publication, configure the [Doop connection](references/doop.md) and record the actual prototype route. To package an existing standalone website build, use the [offline delivery command](references/offline.md).

## Examples

| Example | What it demonstrates |
| --- | --- |
| [Harbor Atlas](examples/harbor-atlas/ACCEPTANCE.md) | A bilingual directory across mobile, tablet, and desktop |
| [Clay Archive](examples/clay-archive/ACCEPTANCE.md) | A bilingual website with a verified offline ZIP |
| [EcoSync](examples/ecosync-stitch/ACCEPTANCE.md) | A Stitch-source mobile app with verified controls and routes |
| [From Kiln to Shelf](examples/clay-storyboard/ACCEPTANCE.md) | A two-shot storyboard with editable Doop frames |

[SKILL.md](SKILL.md) describes the full workflow. For changes to generators or acceptance logic, rerun a representative example and attach its pass or failure evidence to the change.
