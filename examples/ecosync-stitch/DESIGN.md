---
version: alpha
name: Veridian Flow
description: EcoSync smart-home resource tracking for a 390px mobile viewport.
colors:
  primary: "#00D166"
  primary-t0: "#000000"
  primary-t10: "#00210B"
  primary-t20: "#003917"
  primary-t30: "#005224"
  primary-t40: "#006D32"
  primary-t50: "#008A41"
  primary-t60: "#00A750"
  primary-t70: "#00C560"
  primary-t80: "#30E375"
  primary-t90: "#64FF92"
  primary-t95: "#C4FFCB"
  primary-t100: "#FFFFFF"
  secondary: "#007BFF"
  secondary-t0: "#000000"
  secondary-t10: "#001A41"
  secondary-t20: "#002E68"
  secondary-t30: "#004493"
  secondary-t40: "#005BC0"
  secondary-t50: "#0073EF"
  secondary-t60: "#4A8EFF"
  secondary-t70: "#7FABFF"
  secondary-t80: "#ADC7FF"
  secondary-t90: "#D8E2FF"
  secondary-t95: "#EDF0FF"
  secondary-t100: "#FFFFFF"
  tertiary: "#0F172A"
  tertiary-t0: "#000000"
  tertiary-t10: "#131B2E"
  tertiary-t20: "#283044"
  tertiary-t30: "#3F465C"
  tertiary-t40: "#565E74"
  tertiary-t50: "#6F778E"
  tertiary-t60: "#8990A8"
  tertiary-t70: "#A3ABC4"
  tertiary-t80: "#BEC6E0"
  tertiary-t90: "#DAE2FD"
  tertiary-t95: "#EEF0FF"
  tertiary-t100: "#FFFFFF"
  neutral: "#64748B"
  neutral-t0: "#000000"
  neutral-t10: "#0B1C30"
  neutral-t20: "#213145"
  neutral-t30: "#38485D"
  neutral-t40: "#505F76"
  neutral-t50: "#68788F"
  neutral-t60: "#8292AA"
  neutral-t70: "#9CACC5"
  neutral-t80: "#B7C8E1"
  neutral-t90: "#D3E4FE"
  neutral-t95: "#EAF1FF"
  neutral-t100: "#FFFFFF"
  primary-role: "#006D32"
  secondary-role: "#005BC0"
  tertiary-role: "#213145"
  surface: "#F8F9FF"
  surface-dim: "#D7E3F4"
  surface-container-lowest: "#FFFFFF"
  surface-container-low: "#EFF4FF"
  surface-container: "#E5EEFF"
  surface-container-highest: "#D3E4FE"
  primary-container: "#00D166"
  primary-fixed: "#C4FFCB"
  error-container: "#FFDAD6"
  surface-bright: "#F8F9FF"
  surface-container-high: "#DCE9FF"
  secondary-surface: "#DCE9FF"
  on-surface: "#0B1C30"
  on-surface-variant: "#3C4A3D"
  outline: "#697A8B"
  outline-variant: "#BBCBB9"
  on-primary: "#FFFFFF"
  inverse: "#213145"
  on-inverse: "#EAF1FF"
  error: "#BA1A1A"
typography:
  headline-display: {fontFamily: Space Grotesk, fontSize: 32px, fontWeight: 600, lineHeight: 1.12}
  body-md: {fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.55}
  label-sm: {fontFamily: Inter, fontSize: 11px, fontWeight: 600, lineHeight: 1.35}
rounded:
  control: 8px
  stitch-specimen-control: 4px
  specimen: 16px
spacing:
  sm: 8px
  md: 16px
  gutter: 20px
  section: 28px
  content-max: 390px
components:
  button-primary: {backgroundColor: "{colors.primary-role}", textColor: "{colors.on-primary}", rounded: "{rounded.stitch-specimen-control}"}
  button-secondary: {backgroundColor: "{colors.secondary-surface}", textColor: "{colors.on-surface-variant}", rounded: "{rounded.stitch-specimen-control}"}
  button-inverted: {backgroundColor: "{colors.inverse}", textColor: "{colors.on-inverse}", rounded: "{rounded.stitch-specimen-control}"}
  button-outlined: {textColor: "{colors.on-surface-variant}", rounded: "{rounded.stitch-specimen-control}"}
  navigation-active: {backgroundColor: "{colors.primary-fixed}", textColor: "{colors.primary-role}", rounded: 9px}
  switch-off: {backgroundColor: "#C8D3E0", textColor: "{colors.on-primary}", rounded: 20px}
  switch-on: {backgroundColor: "{colors.primary-role}", textColor: "{colors.on-primary}", rounded: 20px}
---

## Style source confirmed

Use the user-supplied [Digital Fluidity & Resource Intelligence](DESIGN.source.md) as written design authority for EcoSync. Use the [Veridian Flow Stitch project](https://stitch.google.com/projects/10100603439629535839) for screen, palette and specimen evidence. The source was supplied in chat. It has prose and explicit values, with no exported YAML or icon inventory.

## Color and surfaces

The four card heads and 48 swatches are transcribed from Stitch. Keep the palette seed Primary #00D166 separate from the semantic Primary #006D32. The source confirms Energy and Water roles, four base layers, white lowest surface, ink and a ghost outline. Use tonal separation and soft tinted shadow on floating chrome. Keep borders off sections and dividers out of resource lists. A gradient on the data dial represents the Energy flow.

The blue semantic role and pale switch, meter and status accents are port values derived from measured shades or designed to fit the original. Secondary, Inverted and Outlined button swatches are observed Stitch catalog specimens. The actual app has a source-led Primary CTA and visually separate resource values.

## Typography and shape

Use Space Grotesk for headlines and figures, Inter for Body and Label. Type sizes and weights are port values. App Primary radius is 8px from the prose. Stitch's four measured specimen buttons retain a separate 4px token. The Outlined specimen represents the Stitch sampler. App cards use tonal layers and app navigation uses translucent blur.

## App layout

One Mobile Page at 390px. Main Dashboard has a dual resource dial, horizontal appliance cards and asymmetric Energy insights. Usage History shows the weekly overview and breakdown. Automations displays flow states. Settings has a visible navigation item and no reference screen.

## Icons

The Stitch style specimen displayed generic Search, Home, Person, Edit, Auto Fix, Category, Tag and Delete examples. The product screens use their own Material Symbols ligatures. The port uses named public SVG versions of the observed glyphs, shared by screens, Style Card and Asset Cards. See the seeded IDs and sources in [asset/manifest.json](asset/manifest.json). SVG geometry or weight can differ from the fonts in Stitch. No product action is inferred from a specimen glyph. The original profile image is outside the icon inventory and was not ported.


## Release sample adaptation

The live Stitch canvas was rechecked for the three named screens and Veridian Flow specimen. The editable HTML is a reference-based reconstruction stored with this sample. Font stacks prefer the named faces when installed and fall back to local system sans-serif. The offline package requests no network fonts. The mobile route and downscaled previews are prototype behavior. See [acceptance](ACCEPTANCE.md) for the evidence.
