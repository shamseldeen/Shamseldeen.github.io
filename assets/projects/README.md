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
# Interior-page visuals · September 2026

`learning-workspace-v1.webp` (1600 × 900) and
`learning-workspace-v1-small.webp` (640 × 360) are a generated editorial
illustration used on the learning page and the homepage learning section.
They do not depict the author's actual desk, a certificate, or project results.
Created with the built-in image-generation tool (new image); resized and
compressed to WebP for delivery. The original generation remains separate.

Final prompt:

```text
Use case: photorealistic-natural
Asset type: wide editorial hero image for the learning page of Shams Insights, a professional bilingual data analyst portfolio.
Primary request: a calm, polished visual about studying data and turning learning into practical analysis.
Scene and subject: a cream matte desk seen at a graceful three-quarter overhead angle, an open blank ivory notebook with subtle pale square grid, a simple deep forest-green hardback study book beneath it, a sharpened natural wood pencil, and part of a contemporary silver laptop. The laptop screen is at an angle, showing only a soft abstract arrangement of green rectangular interface shapes, with no readable text, no numbers, no charts or claims. A small forest-green ceramic cup sits near the upper edge.
Style: editorial still-life photography, realistic paper and ceramic textures, refined and welcoming. Soft warm daylight and gentle shadows. Spacious and minimal, with strong hierarchy and restrained objects.
Color palette: cream #f6f3eb, paper #fffdf7, deep forest green #0b2f26, muted sage; a tiny warm terracotta accent is acceptable.
Composition: landscape 16:9; entire notebook and green book visible centrally, laptop partly visible on one side. Balanced as a standalone image with no overlaid text. No people, no hands, no logos, no letters, no numbers, no fake certificate, no watermark, no pills or clinical equipment. This is an illustrative workspace, not a photograph of the user's actual work or proof of project results.
```

The nutrition pages reuse the existing acerola/guava illustration. Vitamin C
and model-error charts come from the existing reproducible project outputs;
their data and values were not changed. The Power BI hero uses the existing
actual report preview and links to the full screenshot. The three data-grain
cards reproduce the documented table grains, row counts and dimensions.

All ten pages load `image-viewer.js` and the shared responsive imagery CSS.
The native image dialog supports keyboard focus, Escape, a close button and
an original-image link. Project navigation and certificate verification links
retain their destinations. Full-analysis hero changes are also recorded in
`learning/nutrition/build_web_analysis.py` so a rebuild retains the layout.
