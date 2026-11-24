---
name: stitch-in-doop
description: Rebuild a Google Stitch project or apply a confirmed DESIGN.md in Doop. Use for editable website or app previews by device, or video storyboards by shot, with named Style and Asset Cards on each Page.
---

# Stitch in Doop

Deliver an editable Doop project with traceable design sources and recorded acceptance results.

| Step | Required output | Where to work |
| --- | --- | --- |
| 1. Confirm source | Authority, theme, target platforms and unresolved differences | [Source conversion](references/conversion.md). When Stitch is the source, inspect the named project in the built-in browser. |
| 2. Prepare inputs | DESIGN.md, style settings, page manifest and asset inventory | [Workflow](references/workflow.md) · [Copyable templates](references/templates.md) |
| 3. Build cards and previews | One Style Card, Asset Cards and editable previews on each Page | [Card rules](references/cards.md) · [Website and app](references/interfaces.md) · [Storyboard](references/video.md) |
| 4. Measure locally | Generated project with passing browser reports | Follow [setup and commands](references/workflow.md). For a complete website or app handoff, run [offline delivery](references/offline.md). |
| 5. Publish and verify | Doop Pages, verified prototype routes and repeat-sync result | [Doop delivery](references/doop.md). Report native verification separately from local browser checks. |

Keep the Style Card at 900 × 540 with Color → Font → Component. Group Asset Cards by peer elements in the same page region. Keep their width at 900 and fit the height to the occupied rows. Show each icon ID once per Page in a color measured from the preview. Follow the [card layout and icon rules](references/cards.md). Let localized title blocks grow and shrink with their text.

Use [Harbor Atlas](references/reproduction.md) for the responsive reference, [Clay Archive](examples/clay-archive/ACCEPTANCE.md) for the bilingual ZIP, [EcoSync](examples/ecosync-stitch/ACCEPTANCE.md) for the Stitch-source app, and [From Kiln to Shelf](examples/clay-storyboard/ACCEPTANCE.md) for the storyboard.

## Required website and app output

Use this project layout for website and app deliveries. Keep the same editable preview HTML for desktop and mobile wherever the content is shared. Apply device-specific layout through responsive styles and declare the device frames separately in `pages.json`.

```text
<PROJECT_DIR>/
  DESIGN.md
  project.json
  pages.json
  offline.json
  pages/
    *.html
  style/
    card.json
    icon/
  asset/
    manifest.json
    raw/
      icons/
      illustrations/
      photos/
  reports/
  dist/
    index.html
    css/
    js/
    data/
    asset/
  <project-slug>.zip
```

- `DESIGN.md` records colors, type scale, spacing, component variants, interaction states and responsive rules. Store shared source CSS, scripts and sample data alongside the preview sources as needed.
- `asset/manifest.json` records each asset ID, project-relative source path, dimensions, provenance, license and usage by page. Preserve the existing manifest schema and card grouping. Materialize raw subdirectories for the asset types in use.
- `pages.json` declares devices, frames, entry points and expected routes. Each published device Page contains a Style Card, its relevant Asset Cards and clickable previews. Record expected and observed destination Frame IDs for each actual click, starting from the declared entry point. Compare the full ordered route with the expected route, including its length. Check the sync preview again with the same inputs and record the operation count in `reports/`.
- Complete website and app handoffs include a standalone `dist/` and a ZIP of its contents. Declare offline flows in `offline.json`. The [offline delivery command](references/offline.md) extracts the ZIP and checks its root `index.html` and routes in offline Chrome.

The [Rainroom plan](examples/rainroom/PLAN.md) illustrates how to specify a desktop and mobile project with business routes and persisted state.
