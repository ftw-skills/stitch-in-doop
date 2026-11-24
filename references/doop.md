# Doop delivery and verification

## Runbook

| Step | Input | Action and pass condition |
| --- | --- | --- |
| 1. Select target | Passing local reports, desired canvas and Doop account | Read the current MCP guide and canvas guidelines. Use a fresh canvas for exact reproduction if older Pages contain retired frames. |
| 2. Preview | Project source files and existing sync state, if any | Run the preview command. Match each proposed change to the intended Page or Frame before applying. |
| 3. Publish | Reviewed change list | Apply only in the publication scope. Read back Frame IDs and dimensions, actual asset loads and valid prototype targets. |
| 4. Exercise | Page ID, entry Frame and route list | Open the native prototype and click the specified routes. Record start, action and observed destination. Review screenshots separately for visual fit. |
| 5. Recheck | Same project input | Preview again. An unchanged project produces zero operations. Save the canvas URL, browser reports and native evidence. |

Configure `STITCH_DOOP_MCP_URL` and, where needed, `STITCH_DOOP_MCP_AUTH` with the full Authorization header. A host adapter exposing `connectDoop()` can be supplied using `STITCH_DOOP_CLIENT_MODULE`.

```text
node scripts/sync-doop.mjs "<PROJECT_DIR>"
node scripts/sync-doop.mjs "<PROJECT_DIR>" --apply
node scripts/sync-doop.mjs "<PROJECT_DIR>"
```

## Edit and verification rules

- Keep `reports/doop-sync.json` with the project to reuse its canvas and Frame IDs. Save snapshots from `reports/snapshots/` before making unrelated changes.
- Existing anchors rely on stable, unique layer names. Concurrent edits, missing anchored layers and material changes to approved frames stop the sync.
- Doop inserts its own font links and styles. Sync compares authored HTML and lets Doop manage the reserved `data-doop-webfonts` and `data-doop-fonts` tags.
- Incremental sync leaves retired Pages and Frames in place. When inspecting an MCP reply, check its actual JSON envelope for Pages and Frames.
- A zoomed prototype iframe can affect pointer positions. Use the outer iframe transform and inner element rectangle when browser automation cannot click the intended control.
- Record local verification, actual native clicks and production behavior separately. A checked route target alone establishes routing structure.

## Native route evidence

Declare `expectedRoute` for each device or shot in `pages.json`. List the configured `start` key first, followed by the destination key after each click. For a two-click language round trip, use `["en", "zh", "en"]`. For a single-frame shot, list the one entry key and record the Frame ID seen when opening it.

The native report contains `url`, `frames`, `repeatedChanges` and one route per device in manifest order. Each route includes `page`, `width`, `states` and `observedFrameIds`. Record the active Frame ID at entry and after each actual click. The validator resolves the expected keys through `reports/doop-sync.json` and compares both arrays in order, including their lengths.

For an older project, add its intended routes to the device manifest and record the observed Frame IDs from the native player before using `--native-report`. The browser-only check runs with the existing project inputs.

Use the [handoff record](templates.md#handoff-record) to report the result.
