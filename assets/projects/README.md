# Project visuals

Added 23 September 2026. These assets support the existing English and Arabic portfolio; none changes project data or results.

| Asset | Source and purpose |
| --- | --- |
| `nutrition-cover-v1.webp` | AI-generated editorial still life, 1600 × 900. Used on the Food case-study hero and project cards. |
| `nutrition-cover-v1-small.webp` | The same composition at 640 × 360, selected through responsive `srcset`. |
| `power-bi-preview-v1.webp` | Compressed preview of the existing `p00-executive-overview.jpg` report screenshot. Its content is unchanged. |
| `warehouse-layers-v1.svg` | Original code-authored diagram. Bronze is current; Silver and Gold are explicitly marked planned. |
| `synthetic-data-v1.svg` | Original conceptual diagram of products, sales and stock feeding synthetic records. No real records are depicted. |
| `image-features-v1.svg` | Original conceptual illustration of features, PCA and SVM. It is not a tissue sample or a model-result chart. |

## Image generation

The Food cover was created with the built-in image generation tool, not the fallback CLI. Its caption identifies it as an illustration, separate from the measured results. Only resizing and WebP compression were applied when preparing web assets.

Final prompt:

> Use case: product-mockup. Asset type: editorial website project cover for a pharmacist's data-analysis portfolio, Shams Insights. Create a refined landscape still-life photograph illustrating a fruit vitamin C analysis. Main subject: a small group of accurately shaped fresh red acerola (Malpighia emarginata, West Indian cherry), shallowly three-lobed with a few small smooth green leaves. Beside them, one whole pale-green guava and one half guava with pink flesh and tiny natural seeds. A low matte dark-forest-green ceramic dish and warm cream plaster surface, soft daylight, gentle credible shadows, restrained warm palette matching #f6f3eb cream and #0b2f26 forest green. A tiny muted orange accent can come from the natural lighting. The fruit should feel real, appetizing, and carefully photographed, with natural texture rather than plastic perfection. Wide 16:9 composition, main fruit group arranged around the center with breathing room on both sides, all fruit fully inside the frame, background quiet. This is a tasteful editorial cover, not a chart or medical claim. No letters, numbers, chart bars, logos, watermark, medicine, laboratory equipment or people. Output one polished landscape image suitable for an image-led project card and case-study hero.

## Layout and accessibility

- Shared presentation is in `project-visuals.css` and uses the existing palette.
- Localized alternative text and captions are in each HTML edition.
- Images reserve their dimensions. Cards use lazy loading; the Food hero image has high fetch priority.
- Illustrations include no numerical results. The study's existing figures remain the source of quantitative comparisons.
- The full analysis remains focused on charts, code and results. Rebuilding it from `learning/nutrition/build_web_analysis.py` preserves the case-study header and styles without adding a duplicate cover.
