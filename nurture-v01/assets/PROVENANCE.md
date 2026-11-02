# Asset provenance — regenerated studio series

## Full-tin material study replacement

masters/finish-angle.png is a freshly generated complete three-quarter tin portrait based on reference/product-reference.png, made with the built-in image_gen tool on 9 October 2026. It replaces the material section's former lid close-up, which left too much blank space above the product while scrolling. The tin begins near the top of a 3:4 frame and its entire silhouette rests on pale stone. product/finish-angle.webp and finish-angle-small.webp retain that composition without CSS cropping or image retouching. Exact request and output ID are in GENERATION.md. masters/finish.png is retained only as source history; its obsolete WebP deliveries have been removed. The new image remains an explicitly disclosed packaging interpretation, with the same unapproved artwork/formulation limitations.

## Mobile and header refinement

The header now uses brand/nurture-wordmark.svg: seven outlined Cormorant Garamond uppercase letters with authored spacing. Its source is brand/create-wordmark.py and the original font/license is retained in fonts/. No external font is needed to render this asset. brand/trayn-endorsement-master.png is a built-in image_gen flat espresso adaptation of the user-supplied metallic TRAYN Nutrition mark. brand/trayn-endorsement.webp is its lossless, alpha-trimmed delivery. The original mark remains preserved. At header size the endorsement is intentionally subordinate; generated shape differences remain possible.

masters/hero-mobile.png and front-mobile.png are new paired upright near-front product concepts, composed for phones. Four responsive WebP deliveries use 360px and 720px widths, with the whole generated frame retained. Picture sources deliver them only below 760px. These remain disclosed concept interpretations, with the same unapproved artwork/formulation limitations as the desktop series. Exact prompts and output IDs are in GENERATION.md. All new assets, including the regenerated sharing composition, live under root assets/.

All asset sources and deliverables for the root application are self-contained in this assets/ directory. Deleting the archived application will not affect development, regeneration from saved masters, production builds or deployed media.

## Identity sources

reference/product-reference.png is a preserved copy of the user-supplied packaging mockup. reference/trayn-symbol.png and trayn-wordmark.png are the supplied brand marks. reference/studio-anchor.png is the first built-in generated studio cutout, retained because it informed the matching front master. Brand marks are not redrawn. brand/*.webp are lightweight encodings of their alpha silhouettes, tinted espresso in CSS. The simple Nurture favicon is an authored n monogram.

fonts/ contains the actual five self-hosted WOFF2 files and original SIL Open Font License notices for Cormorant Garamond and Manrope. icons/ contains Solar arrows sourced via Iconify, authored by 480 Design under CC BY 4.0, with attribution and original license metadata retained.

## Regenerated product images

Generated with the built-in image_gen tool on 9 October 2026, using the supplied mockup as identity reference. Seven final PNG masters are preserved; the first angle candidate was refined to create a visible change of view.

- masters/hero-angle.png: restrained upright 25-degree rotated view, transparent alpha.
- masters/front.png: matching straight-front view, transparent alpha.
- masters/finish.png: separately composed gold lid and upper-label study, complete brand lettering visible.
- masters/artwork.png: separately composed printed profile and botanical detail; no cut-off letters.
- masters/open.png: upright empty tin with its lid resting beside it, entire objects visible.
- masters/top.png: deliberate aligned overhead lid study, complete circle visible.
- masters/ritual.png: complete upright tin on pale stone beside ivory linen.

The exact selected generation requests, input roles and output IDs are recorded in GENERATION.md. product/ contains responsive WebP deliverables; manifest.json records dimensions, byte sizes and master mapping. scripts/prepare-media.mjs reads only these root masters and reference brand marks. Product framing is preserved: resize and encode only, with no crop, alpha trimming, perspective adjustment or retouching.

social/social-preview.jpg is a freshly regenerated 1200 × 630 editorial sharing composition using the new angle cutout and root-hosted typography. scripts/social-preview.mjs produces its exact layout and copy; no packaging image from the archived site is used.

## Concept limitations

These are generated packaging interpretations, not photographs of a manufactured product. The illustration, label lettering, dimensions, interior construction and finish may differ from the source reference. Existing reference label copy is reproduced as mockup artwork, not verified product information. No final formula, nutrition quantities, certifications or benefit claims are inferred or added. The website explicitly identifies the product and images as concepts and leaves unknown launch data unrendered.

## Deployment

Vite serves root assets/ in development. Production emits referenced fonts/marks and copies runtime product, icon, brand and social files under dist/assets/. Original reference files and generation masters are not deployed. Font licenses and icon attribution are included in delivery. No external image/font service or archive path is required.
