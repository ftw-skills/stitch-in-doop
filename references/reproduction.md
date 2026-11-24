# Reproduce Harbor Atlas

Use the [published Harbor Atlas canvas](http://localhost:4400/c/8rZSDGvzVD) and its [acceptance record](../examples/harbor-atlas/ACCEPTANCE.md) as the final presentation reference. [Clay Archive](../examples/clay-archive/ACCEPTANCE.md) applies the same procedure to a separate project and includes a verified offline ZIP.

The bundled [Harbor Atlas inputs](../examples/harbor-atlas/) include DESIGN.md, project and device manifests, HTML sources, SVGs, photo sources and license notes. The example uses platform fonts listed in DESIGN.md. Install those families or document a substitution before treating the exact font checks as passing.

From the skill folder, after installing its script dependencies and making Chrome available, use a new directory:

```text
node scripts/reproduce-example.mjs "<NEW_PROJECT_DIR>"
node scripts/accept-project.mjs "<NEW_PROJECT_DIR>"
node scripts/sync-doop.mjs "<NEW_PROJECT_DIR>"
node scripts/sync-doop.mjs "<NEW_PROJECT_DIR>" --apply
node scripts/sync-doop.mjs "<NEW_PROJECT_DIR>"
```

The first command reconstructs the Style Card, generated page CSS, asset inventory, Asset Cards and browser reports. The second checks that the generated artifacts, screenshots and reports match the input manifests. Run the Doop commands when publishing is in scope. Expect zero operations on the repeat preview. Use a fresh canvas for exact reproduction when a previous canvas contains retired frames.

| Check | Expected |
| --- | --- |
| Page inventory | Mobile 390 × 844, Tablet 820 × 1050, Desktop 1440 × 1024, English and 简中 on each. Native screen heights are 2500, 1590 and 1320 px respectively. |
| Frame inventory | On every Page one Style Card, Directory Navigation, Main Section, Photography, and two localized screens. There are 18 frames in total. |
| Cards | Style Card 900 × 540, Color → Font → Component, 48 ramp steps, Headline/Body/Label/Input font rows, four button variants and independent two-axis scrollbars. Asset Card dimensions follow occupied tiles. |
| Identity | 34 icons and 3 photographs per Page. Show 4 icons on Style Card and 30 on Asset Cards with zero overlap. Main Section keeps all 26 directory icons in page order. Retain measured appearances in the inventory. |
| Typography and geometry | H1/H2/H3 match the device profile. Mobile H1 wraps to two lines in English and fits on one in Chinese. The Chinese header occupies less space. Check actual font face, clipping, overflow and photo loads. |
| Native behavior | In Doop, click English → 简中 → English on each device Page. Compare the observed Frame IDs with the published IDs for the complete expected route, including the starting Frame and total length. Verify frame sizes and actual image loads. |

Read `reports/layout.json`, `reports/preview.json`, `reports/asset-preview.json`, `asset/cards/index.json` and `asset/inventory.json` as the local record. Inspect screenshots for overflow, alignment and contrast. Record native-player results separately from browser-only generation. Canvas IDs and platform font metrics depend on the host.

When the project has a recorded native report, reconcile it with the saved canvas and page manifests. See [native route evidence](doop.md#native-route-evidence) for the required fields.

```text
node scripts/accept-project.mjs "<PROJECT_DIR>" --native-report "reports/doop-acceptance.json"
```

The command checks the recorded evidence. Perform the native clicks before producing that report.
