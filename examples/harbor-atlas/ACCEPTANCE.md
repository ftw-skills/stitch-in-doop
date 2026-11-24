# Harbor Atlas acceptance reference

Use the [Harbor Atlas Doop canvas](http://localhost:4400/c/8rZSDGvzVD) as the presentation reference. Use [DESIGN.md](DESIGN.md) for the design rules and [pages.json](pages.json) for device profiles, editable sources and expected routes. Run the procedure in [Reproduce Harbor Atlas](../../references/reproduction.md) in a clean project directory.

| Page | Browser viewport | Native screen Frame | Ordered route |
| --- | --- | --- | --- |
| Mobile | 390 × 844 | 390 × 2500 | English → 简体中文 → English |
| Tablet | 820 × 1050 | 820 × 1590 | English → 简体中文 → English |
| Desktop | 1440 × 1024 | 1440 × 1320 | English → 简体中文 → English |

Each Page has the Style Card at 900 × 540, Directory Navigation at 900 × 134, Main Section at 900 × 614, Photography · Crop Study at 900 × 306 and two localized screens. This gives 18 Frames. Keep 48 color-ramp steps, four bilingual type roles, four button variants and independent scrollbars. Count 34 distinct icon IDs across the cards, with four on the Style Card and 30 on the two icon Asset Cards. The Main Section lists 26 service icons in source order. The Photography card shows three local crops.

Measure the title line counts, all three heading sizes and grid geometry from the browser. Inspect the cards and photos in Doop. Start from the configured English Frame for each Page and perform both native clicks. Check the start and each observed destination against the published IDs for the device's `expectedRoute`. Require the same sequence length and order. Preview the identical sync again and require zero operations.

The reference run passed 313 browser checks, three native routes and a zero-operation repeat sync. The [recorded native results](evidence/doop-acceptance.json) include the observed destinations and Frame geometry. Copy only source inputs when creating a new canvas so its sync state starts fresh.
