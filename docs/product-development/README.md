# Nurture product development

These documents capture the proposed food product and invite independent food-technologist evaluation. They are concept materials; ingredient quantities, suitability, manufacturing instructions and claims have not been validated.

- [Detailed discussion and working brief](nurture-product-development-notes.md): the complete product discussion, options, rationale, questions and references.
- [Food technologist review PDF](../../output/pdf/nurture-food-technologist-review-brief.pdf): a concise, three-page Nurture-branded brief for sharing. The packaging image is a generated concept; its artwork and claims are unapproved.

Both files are intentionally versioned in Git. They do not change the website or enter its production build. The PDF uses the repository's outlined NURTURE wordmark, flat TRAYN Nutrition endorsement, local licensed fonts and existing concept image; no external assets are required.

## Regenerate the PDF

From the repository root, using Python with these document-tooling dependencies installed:

```sh
python -m pip install reportlab "fonttools[woff]" pillow
python scripts/build_product_brief.py
```

The script resolves the repository relative to its own location, embeds the local fonts, draws the real wordmark as vectors and writes `output/pdf/nurture-food-technologist-review-brief.pdf`. The three-page brief's curated content and layout live in that script; revise its copy when updating the brief. Temporary font conversions and render checks live under ignored `tmp/pdfs/`. Font licenses and asset provenance remain in `assets/`.

Before sharing an updated edition, render all pages with Poppler and inspect the layout:

```sh
pdftoppm -r 130 -png output/pdf/nurture-food-technologist-review-brief.pdf tmp/pdfs/nurture-review/page
```

Keep the detailed Markdown and the PDF's stated goals, working proposals and unresolved decisions consistent. Update the document date deliberately when issuing a new substantive edition.
