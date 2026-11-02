# Nurture product development

This is the shared product-information folder for every Nurture page version, starting with `/nurture-v01/`. Formulation, costing and technical briefs live here independently of page design. This folder is excluded from the website build.

These documents capture the proposed food product and invite independent food-technologist evaluation. They are concept materials; ingredient quantities, suitability, manufacturing instructions and claims have not been validated.

- [Detailed discussion and working brief](nurture-product-development-notes.md): the complete product discussion, options, rationale, questions and references.
- [MPC coffee trial formulation and testing plan](nurture-mpc-coffee-trial.md): the 19 October bench proposal with a 25 g serving, a 1 kg batch, provisional B12/D targets, and hot-water/hot-milk sensory and mixing tests. This advances the formulation discussion; its quantities and performance remain subject to technical validation.
- [Food technologist review PDF](briefs/nurture-food-technologist-review-brief.pdf): a concise, three-page Nurture-branded brief for sharing. The packaging image is a generated concept; its artwork and claims are unapproved.
- [Serving-cost workbook](costing/nurture-serving-cost.xlsx) and [250 kg feasibility workbook](costing/nurture-250kg-feasibility.xlsx): working estimates with assumptions and published ingredient listings; these are not firm supplier quotes.
- [Supplier quote request](costing/supplier-quote-request.txt): prepared request text; it has not been sent to suppliers.

`costing/` also preserves the workbook preview images and verification exports. The original workbook builders live in `tools/costing-model/`; they resolve output paths relative to this folder and require the `@oai/artifact-tool` authoring runtime. The installed runtime is a local dependency, not part of the repository. No page version owns these models.

These documents are intended to be versioned in Git. They do not change the website or enter its production build. The PDF remains the earlier 17 October concept brief; the later trial plan is its formulation follow-up. The PDF uses the repository's outlined NURTURE wordmark, flat TRAYN Nutrition endorsement, local licensed fonts and existing concept image; no external assets are required.

## Regenerate the PDF

From the repository root, using Python with these document-tooling dependencies installed:

```sh
python -m pip install reportlab "fonttools[woff]" pillow
python docs/nurture/tools/build_product_brief.py
```

The script resolves the shared product folder relative to its own location, embeds the local fonts, draws the real wordmark as vectors and writes `docs/nurture/briefs/nurture-food-technologist-review-brief.pdf`. The three-page brief's curated content and layout live in that script; revise its copy when updating the brief. Temporary font conversions and render checks live under root ignored `tmp/pdfs/`. Font licenses and asset provenance remain in `docs/nurture/assets/`.

Before sharing an updated edition, render all pages with Poppler and inspect the layout:

```sh
pdftoppm -r 130 -png docs/nurture/briefs/nurture-food-technologist-review-brief.pdf tmp/pdfs/nurture-review/page
```

Keep the detailed Markdown and the PDF's stated goals, working proposals and unresolved decisions consistent. Update the document date deliberately when issuing a new substantive edition.
