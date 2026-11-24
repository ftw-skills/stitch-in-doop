# Video storyboards

Use one Doop Page per shot, named `Shot <NN> · <SHOT_TITLE>`. Preview sizes follow the selected video aspect ratio.

| Step | Action | Output |
| --- | --- | --- |
| 1. Capture the brief | Confirm style source, language, aspect ratio and timings. Normalize a supplied treatment or style guide into reusable tokens. | Shot list and DESIGN.md |
| 2. Prepare each Page | Put the Style Card and actual shot assets on the left. Use consistent IDs for shared artwork. | Character, prop and background cards |
| 3. Compose | Put key composition previews on the right. Record duration, transition and voice or audio notes. | Reviewable storyboard Frames |
| 4. Accept | Check crops, safe areas, text and continuity. Test links if a native click-through is requested. | Storyboard acceptance record |

```text
Shot: <NN> · <TITLE>
Timecode: <START>–<END>
Aspect ratio: <WIDTH>:<HEIGHT>
Composition: <KEY_FRAME_OR_VARIANT>
Assets: <ASSET_IDS>
Transition and audio: <NOTES>
```

When the brief requires a rendered video, use a supported video workflow and verify timing, motion and audio separately.

See [From Kiln to Shelf](../examples/clay-storyboard/ACCEPTANCE.md) for a runnable two-shot example. Use one `devices` entry per shot in `pages.json` with the Frame dimensions and a single-key `expectedRoute` when the storyboard needs a separate static Page for each shot. The native check records the actual entry Frame for each Page.
