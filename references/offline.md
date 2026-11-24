# Offline website and app delivery

Build the project's standalone site into `dist/` using its own build command. Keep a root `index.html`, relative URLs and local copies of the CSS, scripts, data, fonts and images used by the tested routes. Validate the site by navigating from its extracted ZIP under `file://`.

Supply an `offline.json` beside `pages.json`. Name every target device at least once across the flows. Each flow starts at `index.html` and records the expected path after every click or reload. If a click changes state in place, repeat the current path and identify the new state with a visible selector.

```json
{
  "slug": "my-project",
  "flows": [
    {
      "devices": ["Mobile", "Desktop"],
      "steps": [
        {"path": "index.html", "visible": "main h1"},
        {"click": "[data-view-details]", "path": "details.html", "visible": "main article"},
        {"reload": true, "path": "details.html", "visible": "[data-selected]"}
      ]
    }
  ]
}
```

Optional step assertions include `lang` for the root language and `images` for the number of decoded HTML images. Use a selector specific to the expected state for `visible`. For added behavior such as form values or canvas drawing, use the project's browser test and retain its report alongside the shared offline report.

```text
node scripts/offline-delivery.mjs "<PROJECT_DIR>"
```

The command packages the files inside `dist/`, extracts the archive into a fresh temporary directory and uses offline Chrome to exercise each flow at the corresponding device viewport. It checks the exact file URL after each action, image decoding, horizontal overflow and external or failed requests. On success it writes `<slug>.zip` and `reports/offline-acceptance.json`, which includes the archive SHA-256 and the observed states. After a failed attempt, use the exit status and compare the ZIP hash before relying on a report from an earlier run.

See [Clay Archive](../examples/clay-archive/ACCEPTANCE.md) for a static bilingual site and [EcoSync](../examples/ecosync-stitch/ACCEPTANCE.md) for a three-screen flow from a Stitch source.
