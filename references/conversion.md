# Source and conversion

## Establish the authority

| Input | What to confirm and keep |
| --- | --- |
| Stitch with user-provided DESIGN.md | Preserve the supplied file or paste, record its origin and compare it with the screens. Treat it as the policy source. Record observed UI measurements separately when the style sampler or previews differ. |
| Stitch with export available | Record how the export was obtained and its file name. Retain the original. Read screen names, frame dimensions, rendered components, icon names and stylesheet values. |
| Stitch without accessible export | Record the missing export. Inspect the visible canvas and each preview in the built-in browser. Label the resulting DESIGN.md as normalized from observed evidence. Record browser or access limitations. |
| Existing upstream design | Confirm URL or local path, variant/theme, fit for the workflow, language coverage and provenance of assets. Record each meaningful adaptation, such as a CJK font pair or a new neutral ramp. |
| No chosen design | Compare viable sources on target platform, tone, script, component coverage and assets. If choice was delegated, select and state the strongest match. Otherwise surface materially different options and ask when needed. |

Record notes like `source prose: application button 8px`; `Stitch style sampler: 4px observed`; `target: app 8px, reference sampler 4px`. If two pieces of evidence refer to the same surface and conflict, resolve against the agreed priority and name the affected result. If a screenshot is all you have, mark inferred tokens and unknown typography or glyphs. Never describe an inferred file as an original export.

The [EcoSync source record](../examples/ecosync-stitch/SOURCE.md) shows how to trace a real Stitch project through a user-supplied design guide, observed screens and a reproducible HTML reconstruction.

## Convert into project DESIGN.md

Retain the prose as guidance for usage, layout, hierarchy, elevation, interaction and exclusions. Put deterministic values in YAML front matter. The [public DESIGN.md format](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) also admits interleaved YAML. Normalize a rendering copy to front matter for this skill's script.

- **Color.** Give every displayed palette role a tonal ramp. Preserve original steps when available. When defining a ramp, use a documented method, retain the exact role color at a suitable anchor, and check dark-to-light ordering. A default set is T0, T10, T20, T30, T40, T50, T60, T70, T80, T90, T95, and T100. Name the tokens by role and step, for example `primary-t40`. Identify generated steps as local design decisions and normalize actual values to six-digit sRGB hex. Store a palette seed independently from its semantic UI token, such as a button fill or surface, when their values differ.
- **Type.** Map families, weight, role and sizing to `headline-display`, `body-md` and `label-sm` or another token beginning with the role. For glyph coverage compare intended language with font support and CSS fallbacks. Pass the locale to the renderer. In a mixed-language specimen, a per-role `language` can override locale in this renderer. Use `永文` only for the Chinese specimen.
- **Components.** Inspect only relevant controls and variants. Capture fill, text color, outline, radius and actual icon. State hover, focus, disabled and active relationships in prose when the source specifies them. Use `components` with fields such as `backgroundColor`, `textColor` and `rounded`. Use a reference like `{colors.primary-role}` or `{rounded.app-control}`. A component absent from the project can be omitted. When the reference sampler itself is part of the migration, label its provenance and keep separate tokens for distinct app values.
- **Layout.** Write down the actual viewport or shot aspect ratio, typography constraints, spacing cadence, and content behavior at the edges. Keep the left card size independent of preview dimensions. Only add routes and states with a design or requested behavior behind them.
- **Source notes.** Cite original file, preview or asset library and license when applicable. Tag values as source, measured, conversion or local adaptation in prose or a ledger. The converter can resolve tokens. It cannot validate the provenance or choose a source for you.

## Convert to Style Card and Asset Cards

Style Card is a compact visual board. Follow the [three-column structure and naming rules](cards.md). Use exact role colors, font families, and short control labels. Keep descriptions in DESIGN.md. Selected navigation, action or status examples belong under Component and must appear in the previews or be requested explicitly as reference specimens. Generic Stitch specimens alone do not establish product behavior.

Build an inventory from actual JSX/HTML/SVG/asset usage. Record ID, English display name, series, source filename or ligature, preview references and meaning. For instance, `usage-history` can point to an observed ligature `bar_chart`; identify the role by context. Inspect the SVG paths or glyph/font selection where exact artwork matters. Prefer the actual source or the same named upstream icon. Record an SVG variant or local fallback that differs. Use the same implementation for the preview and the card. Sample only needed icons in Style Card and show the full series once in Asset Cards.

| Layer | Conversion rule |
| --- | --- |
| Left cards | Use 900 × 540 for the Style Card. Adaptive Asset Cards keep the same width and take their height from the occupied rows. Reuse the Style Card's padding and tile treatment. |
| Asset categories | Create one card per coherent series and let dense categories paginate. Keep one tile per asset ID by default. |
| Names | Store the overall title in the Frame name. Put item names in asset IDs, layer names, tooltips and accessible names. |
| Images | Preserve native aspect ratio unless the source requires a deliberate crop. |

## Renderer

Run from the skill folder after installing its declared `scripts/package.json` dependency, or set `STITCH_YAML_MODULE` to an existing local YAML module path.

```text
node scripts/style-card.mjs path/to/DESIGN.md path/to/style.html zh-CN
```

| Renderer | Inputs |
| --- | --- |
| `styleSections(design, options)` | Locale, trusted `systemIcons` and `projectIcons`, `widgets` and requested `buttons` |
| `assetSections(design, options)` | Category, layout, trusted `{id, label, markup}` items and optional [usage measurements](cards.md) |
| `htmlFrame` | CSS, authored chunks and optional fonts for standalone previews |

Supply the actual icon files and sanitize third-party markup. Confirm rendered font families through the browser check.
