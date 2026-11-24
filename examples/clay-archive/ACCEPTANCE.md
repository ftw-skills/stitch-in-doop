# Clay Archive acceptance

[Clay Archive in Doop](http://localhost:4400/c/77wQ4zTrrO) applies the [Harbor Atlas acceptance reference](../harbor-atlas/ACCEPTANCE.md) to a separate bilingual ceramics catalog. See [DESIGN.md](DESIGN.md) for the visual rules and [pages.json](pages.json) for device dimensions, checks and routes.

| Check | Result |
| --- | --- |
| Local generation and acceptance | 269 browser checks passed. Three devices, six localized screen instances, one Style Card and two Asset Cards per device. |
| Native Doop | 15 Frames matched the generated layout. All three English → 简体中文 → English routes matched the expected Frame IDs and sequence lengths. |
| Repeat sync | Zero operations after the final update. |
| Extracted offline ZIP | Root `index.html` opened in offline Chrome. Both language links worked on three viewports. All three photos decoded in each state. Zero external requests, resource errors or horizontal overflow. |

The [Doop evidence](evidence/doop-acceptance.json) records Frame IDs, dimensions and both clicks for each device. The [offline evidence](evidence/offline-acceptance.json) records files visited and decoded image sizes.

Run from the skill root with the script dependencies and Chrome in place.

```powershell
node scripts/project-workflow.mjs check examples/clay-archive
node scripts/accept-project.mjs examples/clay-archive
node examples/clay-archive/build-offline.mjs
node scripts/offline-delivery.mjs examples/clay-archive
```

For a new Doop run, copy the source to a fresh project folder, run the local checks and follow [Doop delivery](../../references/doop.md). Preserve the original IDs in the evidence when reviewing this recorded run.
