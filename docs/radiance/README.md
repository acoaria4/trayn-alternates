# Radiance product development

Shared product material for Radiance page versions, starting with `/radiance-v01/`, the second concept in the picker.

Radiance is a Cafe Latte protein product concept intended for middle-aged and older men and women living with diabetes who require protein intake. The development specification below proposes four formulas, a 34 g portion and a 510 g tin containing 15 portions. Ingredient grades, nutrition, suitability, preparation and shelf life still require evaluation. The 500 g pack size and milk declaration shown on the render remain concept artwork, not final label specifications; two prototypes contain dairy and two explore dairy-free ingredients.

## Product specification and costing

- [Radiance Cafe Latte prototype product specification](radiance-product-spec.md): complete serving and 1 kg bench formulas for MPC dairy, MPC-pea, pea-rice and pea-yeast; ingredient requirements, preparation trials, premium tin packaging, recurring costs, first-launch recovery and sensitivity cases.
- [Editable cost and formula inputs](costing/prototype-inputs.json): supplied ingredient weights, nominal protein fractions, public listing references and explicit low/base/high planning allowances.
- [Calculated estimates](costing/prototype-estimates.json): full-precision results, ingredient line costs, packaging allocation, 500 g comparison and conditional yeast pricing.

Run `node docs/radiance/tools/calculate-prototypes.mjs` from the repository root to verify formula reconciliation and regenerate the calculated specification tables and JSON estimates. Review surrounding prose when changing assumptions; it is intentionally not rewritten by the calculator. These are unvalidated development proposals and unconfirmed production cost estimates, not supplier quotes or final patient-use specifications.

The selected packaging is the original Morning Gold Cafe Latte tin with its stylized Radiance name, champagne lid, central sunburst and engraved latte artwork, preserved at `../alternative-02/packaging/radiance-v02/01-morning-gold-cafe-latte.png`. Later packaging explorations remain for comparison and have not replaced it.

`assets/` contains the selected packaging reference, generated website hero, morning still life, label close-up and transparent Radiance wordmark. `assets/provenance.json` records exact generation prompts, reference identity, art direction and motion decisions. These masters and all documents stay out of deployment.

`npm run assets:radiance` produces the delivery images in `radiance-v01/assets/` using Sharp for size and format conversion; it does not invoke image generation. Fonts and licenses are shared at the repository root. Icons retain attribution with the page assets.

Radiance formulation work is separate from Nurture. Its formulas and cost model live here, with their own assumptions and sources; Nurture's formulation, costing files and supplier-request material are unchanged.
