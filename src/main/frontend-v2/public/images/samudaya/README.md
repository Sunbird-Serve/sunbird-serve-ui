# SERVE Samudaya home page images

Drop the image files below into this folder. Until a file exists, the home page
shows a branded placeholder in its place (no broken-image icons), so the page is
safe to ship before the assets arrive.

Use appropriately licensed photos with traceable sources. Do not imply the people
pictured are Samudaya participants. Avoid watermarked images and photographs of
identifiable children without usage rights.

## Hero collage (authentic volunteering / mentoring / community photos)
Recommended: optimised JPG/WebP, ~1000px on the long edge, < ~200 KB each.

| File          | Suggested subject                              | Rendered aspect |
|---------------|------------------------------------------------|-----------------|
| `hero-1.jpg`  | A volunteer supporting a learner (tall image)  | 3 : 4 (portrait)|
| `hero-2.jpg`  | A mentor and mentee in conversation            | 4 : 3           |
| `hero-3.jpg`  | Community members collaborating together       | 4 : 3           |

## Product screenshots (real SERVE UI)
Recommended: PNG, ~1280px wide. Crop to the relevant screen; avoid personal data.

| File                         | Screen to capture                          | Rendered aspect |
|------------------------------|--------------------------------------------|-----------------|
| `product-discover.png`       | Discovering/exploring opportunities        | 16 : 10         |
| `product-coordinate.png`     | Reviewing/confirming participation         | 16 : 10         |
| `product-contributions.png`  | Viewing delivery / contributions over time | 16 : 10         |

The exact filenames and aspect ratios are configured in
`src/features/home/pages/SamudayaHomePage.tsx` (HERO_IMAGES and PRODUCT_SHOTS).
Change them there if you prefer different names.
