---
version: alpha
name: Harbor Atlas
description: Bilingual responsive waterfront directory and Doop acceptance reference.
omitted: [motion]
colors:
  primary: "#A63F30"
  primary-t0: "#000000"
  primary-t10: "#2A100C"
  primary-t20: "#532018"
  primary-t30: "#7D2F24"
  primary-t40: "#A63F30"
  primary-t50: "#B55F53"
  primary-t60: "#C47F75"
  primary-t70: "#D39F98"
  primary-t80: "#E1BFBA"
  primary-t90: "#F0DFDD"
  primary-t95: "#F8EFEE"
  primary-t100: "#FFFFFF"
  secondary: "#2D615D"
  secondary-t0: "#000000"
  secondary-t10: "#0B1817"
  secondary-t20: "#17312F"
  secondary-t30: "#224946"
  secondary-t40: "#2D615D"
  secondary-t50: "#507B78"
  secondary-t60: "#739693"
  secondary-t70: "#96B0AE"
  secondary-t80: "#B9CAC9"
  secondary-t90: "#DCE5E4"
  secondary-t95: "#EEF2F2"
  secondary-t100: "#FFFFFF"
  tertiary: "#172D2F"
  tertiary-t0: "#000000"
  tertiary-t10: "#0C1718"
  tertiary-t20: "#172D2F"
  tertiary-t30: "#344749"
  tertiary-t40: "#516263"
  tertiary-t50: "#6E7C7D"
  tertiary-t60: "#8B9697"
  tertiary-t70: "#A8B0B1"
  tertiary-t80: "#C5CBCB"
  tertiary-t90: "#E2E5E5"
  tertiary-t95: "#F1F2F2"
  tertiary-t100: "#FFFFFF"
  neutral: "#667579"
  neutral-t0: "#000000"
  neutral-t10: "#141718"
  neutral-t20: "#292F30"
  neutral-t30: "#3D4649"
  neutral-t40: "#525E61"
  neutral-t50: "#667579"
  neutral-t60: "#859194"
  neutral-t70: "#A3ACAF"
  neutral-t80: "#C2C8C9"
  neutral-t90: "#E0E3E4"
  neutral-t95: "#F0F1F2"
  neutral-t100: "#FFFFFF"
  surface: "#F4F0E7"
  surface-dim: "#E0E8E4"
  surface-container: "#EDF2EE"
  on-surface: "#172D2F"
  on-primary: "#FFFFFF"
  secondary-surface: "#C6DFD8"
  outline: "#697D7B"
  outline-variant: "#B5C5BE"
  hero-surface: "#173B3C"
  hero-text: "#F8F6ED"
  hero-muted: "#D9E6DD"
  hero-label: "#AAD1C6"
  feature-surface: "#F3D2BC"
  feature-ink: "#3E2118"
  service-surface: "#E5EEEA"
  service-accent: "#F0E4DB"
typography:
  headline-latin: {"fontFamily":"Georgia","language":"en","fontWeight":400}
  headline-display: {"fontFamily":"Noto Serif SC","language":"zh-CN","fontWeight":600}
  body-latin: {"fontFamily":"Arial","language":"en","fontWeight":400}
  body-md: {"fontFamily":"Noto Sans SC","language":"zh-CN","fontWeight":400}
  label-latin: {"fontFamily":"Consolas","language":"en","fontWeight":400}
  label-sm: {"fontFamily":"DengXian","language":"zh-CN","fontWeight":400}
  input-latin: {"fontFamily":"Arial","language":"en","fontWeight":400}
  input-md: {"fontFamily":"Noto Sans SC","language":"zh-CN","fontWeight":400}
rounded:
  specimen: 15px
  hero: 15px
  service: 8px
  feature: 6px
  navigation: 20px
  language: 50px
spacing:
  grid-gap: 12px
  hero-gap: 18px
  nav-gap: 8px
  mobile-inset: 20px
  tablet-inset: 34px
  desktop-inset: 56px
  main-bottom: 68px
components:
  button-primary: {"backgroundColor":"{colors.primary}","textColor":"{colors.on-primary}","rounded":"6px"}
  button-secondary: {"backgroundColor":"{colors.secondary-surface}","textColor":"{colors.on-surface}","rounded":"6px"}
  button-inverted: {"backgroundColor":"{colors.on-surface}","textColor":"{colors.surface}","rounded":"6px"}
  button-outlined: {"textColor":"{colors.on-surface}","rounded":"6px","borderColor":"{colors.outline}"}
  checkbox-idle: {"backgroundColor":"{colors.surface}","textColor":"{colors.on-surface}","rounded":"3px","borderColor":"{colors.outline}"}
  checkbox-active: {"backgroundColor":"{colors.secondary}","textColor":"{colors.on-primary}","rounded":"3px","borderColor":"{colors.secondary}"}
  switch-off: {"backgroundColor":"{colors.outline-variant}","textColor":"{colors.on-primary}","rounded":"12px"}
  switch-on: {"backgroundColor":"{colors.secondary}","textColor":"{colors.on-primary}","rounded":"12px"}
  inputfield-idle: {"backgroundColor":"{colors.surface}","textColor":"{colors.on-surface}","rounded":"5px","borderColor":"{colors.outline}"}
  inputfield-focus: {"backgroundColor":"{colors.surface}","textColor":"{colors.on-surface}","rounded":"5px","borderColor":"{colors.secondary}"}
---

# Harbor Atlas / 海港图鉴

## Design direction

Harbor Atlas is a bilingual public directory for transport, amenities and services along a waterfront. Use a warm paper canvas, dark tidal green for the introduction, and a restrained terracotta accent. Keep the index easy to scan with a visible section count, stable item order and short service names. Use rules and tinted surfaces to mark boundaries. Use flat surfaces throughout.

The [reference Doop canvas](http://localhost:4400/c/8rZSDGvzVD) governs the rendered design and publication layout. The editable inputs are `pages/en.html`, `pages/zh.html`, `project.json`, `pages.json`, `style/card.json` and `asset/manifest.json`. Each language has one source shared by all three device Pages.

## Color and material

- Use `surface` for the page, `on-surface` for headings and service names, and `outline-variant` for masthead and section rules.
- Use `hero-surface` with `hero-text`, `hero-muted` and `hero-label` in the introduction. Use `feature-surface` and `feature-ink` for its directory link. This link has its own palette and differs from the primary button specimen.
- The standard service tile uses `service-surface` with its glyph and index in `secondary`. Every fourth item starting with the first uses `service-accent` and `primary`. The accent is a visual rhythm independent of status or category.
- The Style Card uses `surface-dim` around `surface-container` tiles. Its four ramps each display T0, T10, T20, T30, T40, T50, T60, T70, T80, T90, T95 and T100. The neutral ramp is a specimen palette for low-emphasis roles.

## Type and localization

| Role | English | Simplified Chinese | Application |
| --- | --- | --- | --- |
| Headline | Georgia | Noto Serif SC | Masthead and section titles use CSS weight 400. The Chinese Style Card sample uses 600. |
| Body | Arial | Noto Sans SC | Introduction and service labels. Body 15 px / 1.5. Service titles are bold. |
| Label | Consolas | DengXian | Eyebrow 12 px / 1.4, language link 13 px / 1.4, count and indices 11 px. |
| Input | Arial | Noto Sans SC | Style Card input specimens. |

Set the document language to `en` or `zh-CN`. For Chinese preview text, use the declared Chinese family followed by the semantic fallback. Where Latin glyphs appear in mixed-script labels, the browser may use a fallback for those glyphs. Load the named platform fonts for exact font tests. The preview and offline ZIP use local fonts.

Apply the H1/H2/H3 sizes below through the stylesheet generated from `project.json`. Use line-height multipliers 1.12, 1.2 and 1.3 respectively. The masthead title uses −0.035em tracking. Keep its title cell flexible and the language link in an auto-width sibling. Allow the header to grow with text. At 390 px the English title takes two lines and the Chinese title fits on one. At the reference tablet and desktop widths both fit on one line.

## Layout and responsive behavior

| Profile | Media query minimum | Test viewport | Doop content frame | Main inset | Grid | H1 / H2 / H3 | Glyph |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 0 px | 390 × 844 | 390 × 2500 | 20 px | 1 column | 32 / 24 / 18 px | 18 px |
| Tablet | 640 px | 820 × 1050 | 820 × 1590 | 34 px | 2 columns | 40 / 28 / 20 px | 20 px |
| Desktop | 1100 px | 1440 × 1024 | 1440 × 1320 | 56 px | 4 columns | 52 / 36 / 24 px | 24 px |

- Center the main region with a 1600 px maximum width and 68 px bottom padding. Add 32 px above the desktop masthead. Give the masthead a 14 px column gap and vertical padding of 12–20 px, scaled by viewport width.
- Start the hero 20 px below the masthead. Use 15 px corners and an 18 px internal gap. Hero padding is 26 × 23 px on mobile, 34 × 32 px on tablet and 46 px on desktop. The decorative coordinate panel appears from 1100 px as the narrower column in a 1.6:1 grid.
- Let navigation scroll horizontally in one row. Use an 8 px gap, 20 px rounding, a 1 px border and 6 × 9 px link padding. Keep the page itself free of horizontal overflow.
- In the directory, align the count to the heading baseline. Give the grid a 12 px gap. Inside each tile place glyph, service name and two-digit index in that order. Use 8 px corners and 9 × 12 px padding. Minimum tile height is 50 px on mobile and tablet, and 62 px on desktop. Keep the same 26 services in the same order in both languages.

## Components and interaction

- The top language link uses a 1 px `outline` border, 50 px corners and 6 × 12 px padding. It opens the matching language on the same device Page. The native prototype starts in English and uses instant navigation. In the offline build the link opens the corresponding relative HTML file.
- The hero link and the directory navigation links point to the directory anchor in the page source. Saved, Overview, Notices, Settings, Activity and Filter are navigation specimens in this sample. Separate destinations and functional filtering are outside the demonstrated flow. Service tiles are informational articles.
- Apply a 2 px `primary` focus outline offset by 4 px to keyboard-focused preview links. Keep visible navigation text paired with its glyph. The coordinate panel is decorative.
- The Style Card shows primary, secondary, inverted and outlined buttons. The control lane shows unchecked and checked checkbox and radio states, off and on switches, and empty, filled and focused English and Chinese input specimens. These states document component styling. The directory screens expose the language route and in-page anchors.

## Style Card and asset inventory

Each device Page contains one 900 × 540 Style Card, with Color, Font and Component columns in that order. Give the columns independent overflow behavior. Show Headline, Body, Label and Input specimens in both scripts. Place Home, Directory, Saved and Overview in the system icon row and use their measured preview colors.

Place three 900 px wide Asset Cards below the Style Card, sized to their contents. The reference heights are 134 px for Directory Navigation, 614 px for Main Section and 306 px for Photography · Crop Study. Directory Navigation shows the other four navigation glyphs. Main Section shows all 26 service glyphs in page order. Photography shows landscape, portrait and square ceramics crops in that order. The three photographs are asset-card specimens sourced from the generated Kiln Notes ceramics sheet. They appear on the board as a crop study. Navigation and utility icons are derived from Material Symbols (Apache 2.0) or the Kiln sample. Eleven harbor glyphs are original outlines.

Use the measurements in `asset/inventory.json` to trace glyph color, rendered size and placement to a preview. Show each of the 34 unique icon IDs once per device Page across the Style Card and Asset Cards. Keep each label and image editable in its frame and preserve figure aspect ratios in the source inventory.

## Acceptance

For all three devices, compare the six published frames per Page with `pages.json` and the reference card dimensions. Measure the H1/H2/H3 scale and directory grid, confirm the mobile title line counts, and review card fit, sampled icon colors and asset loading. Open the native player at the declared English start, click Simplified Chinese, then click English. Record the ordered frame IDs and verify the exact expected sequence and length. Run the sync preview a second time with identical inputs and expect zero operations.

The [reference acceptance record](ACCEPTANCE.md) defines the retained measurements and evidence. Use an extracted offline ZIP to verify relative links separately from the native player.
