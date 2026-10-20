# Radiance product development

Shared product material for Radiance page versions, starting with `/radiance-v01/`, the second concept in the picker.

Radiance is a Cafe Latte protein product concept intended for middle-aged and older men and women living with diabetes who require protein intake. Formulation, serving size, protein quantity, ingredients, nutrition information, suitability and preparation instructions remain to be developed and evaluated. The 500 g pack size and milk declaration shown on the render are concept artwork, not final label specifications.

The selected packaging is the original Morning Gold Cafe Latte tin with its stylized Radiance name, champagne lid, central sunburst and engraved latte artwork, preserved at `../alternative-02/packaging/radiance-v02/01-morning-gold-cafe-latte.png`. Later packaging explorations remain for comparison and have not replaced it.

`assets/` contains the selected packaging reference, generated website hero, morning still life, label close-up and transparent Radiance wordmark. `assets/provenance.json` records exact generation prompts, reference identity, art direction and motion decisions. These masters and all documents stay out of deployment.

`npm run assets:radiance` produces the delivery images in `radiance-v01/assets/` using Sharp for size and format conversion; it does not invoke image generation. Fonts and licenses are shared at the repository root. Icons retain attribution with the page assets.

Radiance formulation work is separate from Nurture. No Nurture ingredient quantities, nutrient targets, costing assumptions or supplier requests have been transferred to this concept.
