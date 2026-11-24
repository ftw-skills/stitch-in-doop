# Website and app layouts

| Step | Website | App |
| --- | --- | --- |
| 1. Select device Pages | Use observed breakpoints and viewport widths. If scope and evidence are silent, use Desktop. | Inspect compact and wide variants, fixed chrome, persistent tabs and overlays. Use the observed device or the shared Desktop default. |
| 2. List Frames | Map URL, content structure and route to each screen. Add requested navigation, detail and empty states. | Map tabs, back actions, sheets and toggles to Frames or local states. Identify unavailable destinations and demo controls. |
| 3. Render at target widths | Check reflow, image crops, text wrapping and navigation at each selected width. | Verify narrow controls, safe areas, scrolling, sticky content and nested horizontal scroll when part of the design. |
| 4. Measure | Record target CSS viewport and actual content dimensions. Preserve stable route IDs across locale variants. | Choose fixed viewport or content-height Frames and record the choice. Use fixture data for state changes. |

Place Style Card and device Asset Cards on the left and screen Frames on the right. A webpage importer can remove nested iframes. If that occurs, inspect the actual preview or official export and reconstruct editable HTML from the available evidence.

Use the [page manifest template](templates.md#screen-and-asset-fragments) and [local acceptance commands](workflow.md#run-in-order).
