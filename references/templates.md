# Fill-in templates

Replace `<PLACEHOLDER>` values before use. These fragments illustrate each input. Use the [complete Harbor Atlas inputs](../examples/harbor-atlas/) for a runnable project.

## Brief for an Agent

```text
Source: <DESIGN_MD_OR_STITCH_URL>
Source priority and documented adaptations: <PRIORITY_AND_CHANGES>
Target: <WEBSITE_APP_OR_STORYBOARD>
Devices or shots: <NAMES_WIDTHS_HEIGHTS_OR_TIMECODES>
Languages and key screens: <LOCALES_AND_SCREENS>
Components and states: <ACTUAL_CONTROLS_AND_VARIANTS>
Assets and categories: <SOURCE_FILES_AND_SEMANTIC_IDS>
Native flows to test: <START_FRAME_AND_ACTIONS>
Delivery scope: <LOCAL_ONLY_OR_DOOP_CANVAS>
Acceptance: run the local checks, review screenshots, record any skipped native tests.
```

## Project manifest fragment

```json
{
  "style": "style/card.json",
  "assets": "asset/manifest.json",
  "pages": "pages.json",
  "typography": {
    "<DEVICE_NAME>": {
      "minWidth": 0,
      "page_title": {"size": 32, "lineHeight": 1.15},
      "section_title": {"size": 24},
      "subsection_title": {"size": 18}
    }
  }
}
```

## Style manifest fragment

```json
{
  "lang": "<LOCALE>",
  "scrollbarDemo": true,
  "buttons": ["primary", "secondary", "inverted", "outlined"],
  "fontSpecimens": {"input": ["<INPUT_TYPOGRAPHY_TOKEN>"]},
  "fonts": [{"family": "<LOCAL_FONT_FAMILY>", "file": "<FONT_FILE>.woff2", "weight": "400"}],
  "widgets": [{"id": "<CONTROL_ID>", "kind": "switch", "label": "<LABEL>", "state": "on", "token": "<COMPONENT_TOKEN>"}],
  "systemIcons": [{"id": "<ASSET_ID>", "label": "<LABEL>", "file": "<SOURCE_FILE>.svg"}]
}
```

## Screen and asset fragments

```json
{
  "name": "<CANVAS_NAME>",
  "devices": [{
    "name": "<DEVICE_NAME>",
    "width": 390,
    "height": 844,
    "frameHeight": 1260,
    "start": "<FRAME_ID>",
    "expectedRoute": ["<FRAME_ID>"],
    "frames": [{
      "id": "<FRAME_ID>",
      "name": "<FRAME_TITLE>",
      "file": "pages/<FILE>.html",
      "checks": [{"selector": "h1", "font": "<FONT_FAMILY>", "lang": "<LOCALE>"}]
    }]
  }]
}
```

The one-key route fits a single-frame Page. For interactive Pages, list the entry and each destination after an actual click. Declare ZIP test flows separately in [offline.json](offline.md).

```json
{
  "classificationVersion": 1,
  "categories": [{
    "id": "<CATEGORY_ID>",
    "name": "<ASSET_CARD_NAME>",
    "kind": "icon",
    "scope": "system",
    "purpose": "<SHARED_PAGE_REGION_OR_PARENT_COMPONENT>",
    "layout": "adaptive",
    "items": [{"id": "<ASSET_ID>", "label": "<LABEL>", "file": "<SOURCE_FILE>.svg", "source": "style", "displayOn": "style"}]
  }]
}
```

Use `<ASSET_ID>` consistently across the manifest, preview `data-icon` and matching Style Card row. Set `scope` to `project` for a domain category. Set `displayOn` to `asset` for icons that appear in the Asset Card. Omit `source` for a file in `asset/raw/<CATEGORY_ID>/`. For photos set `kind` to `photo` and omit the icon-specific `scope` and `displayOn` fields.

## Handoff record

| Field | Fill in |
| --- | --- |
| Source and adaptations | <SOURCE> · <CHANGES> |
| Local acceptance | <PASS_OR_FAIL> · <REPORTS_OR_ERRORS> |
| Pages, Frames and Asset Cards | <COUNTS> |
| Doop and prototype | <URLS_OR_NOT_PUBLISHED> |
| Actual clicks | <PAGE_START> → <ACTION> → <DESTINATION> |
| Repeat sync | <CHANGE_COUNT_OR_NOT_RUN> |
| Offline ZIP | <ARCHIVE_AND_EXTRACTED_BROWSER_REPORT> |
| Limits | <MISSING_FONT_MEDIA_DEVICE_OR_UNTESTED_BEHAVIOR> |
