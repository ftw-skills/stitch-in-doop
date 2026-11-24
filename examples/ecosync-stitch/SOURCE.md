# EcoSync source record

The [EcoSync project in Google Stitch](https://stitch.google.com/projects/10100603439629535839) was re-opened in the built-in browser on 2026-11-24. The canvas showed the Veridian Flow specimen and three editable previews. [The supplied written design guide](DESIGN.source.md) governs the intended treatment. [DESIGN.md](DESIGN.md) records normalized tokens and adaptations.

| Observed in Stitch | Editable source in this sample | Adaptation |
| --- | --- | --- |
| Main Dashboard | [dashboard.html](pages/dashboard.html) | Keep the energy and water dial, appliance switches and bottom navigation. HVAC is a local checkbox. |
| Usage History | [history.html](pages/history.html) | Keep the weekly chart and top consumers. Wire Automate Now to the automations screen. |
| Automations | [automations.html](pages/automations.html) | Keep the three automation tiles and their controls. The dashboard link returns to the entry screen. |
| Veridian Flow specimen | [Style Card settings](style/card.json) | Preserve the green and blue tonal roles. Use shared Material Symbols SVGs from the [asset manifest](asset/manifest.json). |

Stitch's official HTML export was unavailable for the original reconstruction. The editable sources are the maintained local rebuild, derived from the observed previews and supplied guide. Settings has no source preview. The display uses sample resource readings and has no device connection. Doop can supply hosted font faces. The standalone ZIP uses locally available fonts and system fallbacks.
