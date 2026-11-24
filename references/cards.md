# Editable card structure

The renderer reads [card-layout.json](../assets/card-layout.json). Style Card uses three columns from left to right. Put each column name on its layer and accessible label. Keep the card face free of column headings.

| Column | Layers |
| --- | --- |
| Color | `color_primary`, `color_secondary`, `color_tertiary`, `color_neutral`. Name individual steps like `color_primary_t40`. |
| Font | `font_head`, `font_body`, `font_label`. Display the role, family and the glyph sample. |
| Component | `row_button`, `row_small_component`, `row_system_icon`, `row_project_icon`, in that order. |

Use Primary, Secondary, Inverted and Outlined in the button row. Put real checkbox, switch, input field and chip states in small_component. Use product-independent glyphs such as Home, Menu, Exit, Bookmark and Notification in system_icon. Use domain symbols such as Water, Energy or Ice in project_icon. Keep rows named in Doop and keep empty rows free of filler when the project has no matching specimen.

Split the Small Component row into `small_component_controls` and `small_component_inputfield`. Group control specimens by kind and align the centers of these groups with the matching input grid columns. Use a native radio with a centered CSS mark. Input specimens use native text inputs with shared styling and token values for empty, filled and focus states. Keep SVG proportions. Compute the preview size from available cell space and record it as `data-display-size`. Preserve measured page sizes and colors in the asset metadata. Use a separate photo Asset Card and preserve the original aspect ratio by default.

For localized inputs, set `language` on each input widget and use a translated placeholder and filled value. The renderer matches `language` to a token listed in `fontSpecimens.input` and applies that token's family and weight. Repeat the same state columns for each language. The browser check verifies the font binding, column alignment and typing in each language.

Declare the button variants needed for the project or reference sampler. Use inverse surface and text roles for Inverted. Use transparent fill and an explicit stroke for Outlined. The renderer rejects a requested variant if its token group is missing. Specimen-only variants should be recorded separately from controls used on actual screens.

Select components for their usefulness in the project. Show relevant state pairs, such as a navigation item in default and selected states or a switch on and off. Place progress and chart specimens here when the preview uses them. Give their tracks, fills and meaning a named source or example in DESIGN.md. Decorative bars have no implied progress value.

Use lower snake case in `data-doop-name` on the meaningful layer root. Start with the type and name the role or action, such as `button_add_flow`, `switch_hvac`, `chart_usage_bars`, or `photo_red_jar`. Add a stable qualifier for a distinct state or instance when useful. Reuse the same name for the same component across frames. Keep routes, accessibility labels, CSS and design token references separate. Apply names to controls, asset layers and reusable sections. Layout wrappers used only for spacing can remain unnamed.

Create Asset Cards for peer elements in a page region, such as `navigation`, `main_section` and `ceramic_photographs`. Put the category in Frame metadata and `data-category`. Show the asset itself on the card face. Keep captions in the layer name, accessibility metadata and tooltip.

## Icon classification

Set `classificationVersion: 1` in `asset/manifest.json` for new projects. Group icons that occupy equivalent positions under the same logical parent. Copy the preview's reading order into `items`. Use one category per ID and record the display target independently of the SVG source folder.

| Decision | Field | Examples |
| --- | --- | --- |
| Style Card row eligibility | Category `scope` | `system` for shared UI glyphs and `project` for project-specific specimens. This value does not subdivide a peer group. |
| Shared parent or region | Category `id`, `name` | `navigation` for items in the same navigation strip, `main_section` for all icons in the primary directory grid. |
| Meaning | Item `id`, `label` | A stable ID matched by page `data-icon`, with a readable English label that describes the actual function. |
| Specimen or asset | Item `displayOn` | `style` requires the matching `systemIcons` or `projectIcons` row in `style/card.json`. `asset` belongs to the category card. An all-Style category emits no Asset Card. |
| SVG location | Item `source`, category `rawFolder` | `source: "style"` resolves under `style/icon/`. Other items resolve under `asset/raw/<CATEGORY_ID>/`, or under the optional `rawFolder` when regrouping existing files. |

Ferry, weather and drinking water stay together when they are peer tiles in the same main directory. Put the parent or inclusion rule in `purpose`. Set `showProjectIconRow: false` in `style/card.json` and move any project specimens to their Asset Card to show the main-region set together. The [Harbor Atlas manifest](../examples/harbor-atlas/asset/manifest.json) shows a complete example. The generator rejects duplicate IDs and conflicts between category scope and Style Card placement.

## Adaptive Asset Cards

Set the category's `layout` to `adaptive`. The planner holds the frame width at 900 px and sets the height from occupied rows, gaps and padding. SVGs use 136 × 110 px cells in manifest order, up to six per row. A single short row is centered with equal side margins. Photos use 136 × 136 px base cells. Provide `aspectRatio` as width divided by height. The defaults use spans of 3 × 2 for a landscape image, 1 × 2 for a portrait, and 2 × 2 for a square or near-square image. Set `span: [columns, rows]` to override. Photos retain their original ratio inside the allocated cells. Doop places each next frame below the preceding frame's calculated height. `layout: "fixed"` or an omitted `layout` keeps the legacy 900 × 540 card.

| Checklist | Expected |
| --- | --- |
| Geometry | Style Card uses 900 × 540 CSS px. Asset Cards use the dimensions of their layout mode. |
| Identity | Each icon belongs to one manifest category and appears on its declared card once. Selected Style icons remain in the source inventory. |
| Specimens | Render one representative with an observed page color. Preserve all measured colors, dimensions and uses in the inventory. |
| Fonts | Order Font tiles as Headline, Body, Label, Input when input typography is declared. Use a real type token for Input and apply it to the input specimen. |
| Small Component | With `scrollbarDemo: true`, place the horizontal scrollbar at the bottom and the vertical scrollbar at the right. Each has isolated HTML overflow. Verify both offsets can move and the control content stays in place. |
| Native layout | Cards occupy the left column. The right column contains the requested screen or shot Frames. |
| Verification | Local check measures glyphs, clipping and image loading. The acceptance command compares IDs, counts, sizes and screenshots. |

For icons, mark preview glyphs with `data-icon="semantic-id"` and collect computed SVG color, width and height after rendering the relevant states. For a multicolor icon, preserve the source SVG and use a deliberate sort key. The supplied capture function handles sRGB icons using `currentColor` and includes resolved opacity when applicable. Put observations into an inventory keyed by ID.

```json
{
  "home": [
    {"color": "#793F38", "width": 21, "height": 21, "frame": "home"},
    {"color": "#302522", "width": 21, "height": 21, "frame": "catalog"}
  ]
}
```

Run the full browser check to collect `usage` and resolve the display colors for both card types. The renderer selects a deterministic representative by measured color, width and height. Acceptance rejects byte-identical SVGs registered under different IDs. Inspect all relevant states to cover active, default and disabled variants. Preserve photographic crop and series order where a single foreground color would be misleading.

[card-layout.mjs](../scripts/card-layout.mjs) provides `componentName`, `nameAttr`, and a browser function `captureIconUsage`, usable with `page.evaluate(captureIconUsage)`. Render the preview frames, capture observations, render the Asset Cards with the resulting inventory, then compare displayed metadata and computed styles with those observations.
