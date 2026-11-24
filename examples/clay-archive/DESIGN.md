---
version: alpha
name: Clay Archive
description: Bilingual ceramics catalog for a three-device Doop acceptance run.
omitted: [motion]
colors:
  primary: "#8F492D"
  primary-t0: "#000000"
  primary-t10: "#24120B"
  primary-t20: "#482517"
  primary-t30: "#6B3722"
  primary-t40: "#8F492D"
  primary-t50: "#A26750"
  primary-t60: "#B48673"
  primary-t70: "#C7A496"
  primary-t80: "#DAC2B9"
  primary-t90: "#ECE1DC"
  primary-t95: "#F6F0EE"
  primary-t100: "#FFFFFF"
  secondary: "#53634A"
  secondary-t0: "#000000"
  secondary-t10: "#151913"
  secondary-t20: "#2A3225"
  secondary-t30: "#3E4A38"
  secondary-t40: "#53634A"
  secondary-t50: "#707D68"
  secondary-t60: "#8C9786"
  secondary-t70: "#A9B1A5"
  secondary-t80: "#C6CBC3"
  secondary-t90: "#E2E5E1"
  secondary-t95: "#F1F2F0"
  secondary-t100: "#FFFFFF"
  tertiary: "#25291E"
  tertiary-t0: "#000000"
  tertiary-t10: "#090A08"
  tertiary-t20: "#13150F"
  tertiary-t30: "#1C1F17"
  tertiary-t40: "#25291E"
  tertiary-t50: "#494D44"
  tertiary-t60: "#6E7069"
  tertiary-t70: "#92948F"
  tertiary-t80: "#B6B8B4"
  tertiary-t90: "#DBDBDA"
  tertiary-t95: "#EDEDEC"
  tertiary-t100: "#FFFFFF"
  neutral: "#716C60"
  neutral-t0: "#000000"
  neutral-t10: "#1C1B18"
  neutral-t20: "#393630"
  neutral-t30: "#555148"
  neutral-t40: "#716C60"
  neutral-t50: "#89857B"
  neutral-t60: "#A09D95"
  neutral-t70: "#B8B6B0"
  neutral-t80: "#D0CECA"
  neutral-t90: "#E7E7E5"
  neutral-t95: "#F3F3F2"
  neutral-t100: "#FFFFFF"
  surface: "#FAF4E8"
  surface-dim: "#E9E4D5"
  surface-container: "#F5EFE1"
  on-surface: "#25291E"
  on-primary: "#FFFFFF"
  secondary-surface: "#DEE6D2"
  outline: "#736D5D"
  outline-variant: "#CEC5AF"
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
  record: 12px
  selector: 50px
spacing:
  grid-gap: 16px
  mobile-inset: 20px
  tablet-inset: 32px
  desktop-inset: 52px
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

# Clay Archive / 陶器档案

## Direction and color

A bilingual catalog for a small ceramics studio. Use a warm paper background and olive ink. Use terracotta for the eyebrow and focus outline. Olive green marks object glyphs and captions. Place each photo in a tinted field to separate the material from the page.

## Typography

Use Georgia and Noto Serif SC for headings, Arial and Noto Sans SC for body copy, and Consolas and DengXian for labels. Set the root document language. The first heading grows with the localized copy. At 390 px the English title wraps and the Chinese title fits on one line. At the two larger widths both titles fit on one line.

## Layout

Lead with the masthead and locale switch, followed by the introduction and three objects. Keep the language option on the right. Each object places its image first, then its glyph, title and caption. Fit images in their fields with `object-fit: contain`. Keep 12 px corners and a 16 px grid gap.

| Device | Breakpoint | Viewport | Doop frame | Inset | Grid | H1 / H2 / H3 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 0 px | 390 × 844 | 390 × 1400 | 20 px | 1 | 32 / 24 / 18 px |
| Tablet | 640 px | 820 × 1050 | 820 × 1050 | 32 px | 2 | 40 / 28 / 20 px |
| Desktop | 1100 px | 1440 × 1024 | 1440 × 1024 | 52 px | 3 | 52 / 36 / 24 px |

## Components and interactions

The outlined locale pill has a 44 px minimum height, a 2 px keyboard focus outline and a 4 px outline offset. English switches to Simplified Chinese and the reverse link returns to English on the same device. The catalog records are static. The Style Card shows the four button variants, bilingual font and input specimens, and the measured Studio glyph. Group the three object glyphs in catalog order and the three crop ratios on their own Asset Card.

## Source and acceptance

The ceramic photographs are generated Kiln Notes crops also used in the Harbor Atlas template. The object and studio glyphs are original line drawings. Use the bundled assets and verify all three photos on each localized screen and on the native asset card. Start each prototype in English and record both clicks and destination IDs. Verify a repeat preview yields zero operations. Exercise the equivalent locale round trip after extracting the offline ZIP.
