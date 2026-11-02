export const radiance = {
  name: 'Radiance',
  flavor: 'Cafe Latte',
  status: 'A product in development',
  audience: 'Being developed for middle-aged and older men and women living with diabetes who need protein support.',
  details: [
    { id: 'signature', title: 'A name with a little life.', label: 'The signature', text: 'Flowing lettering, warm ivory, and a brushed champagne lid. An everyday object, given a little extra care.', image: './assets/product/packaging.webp', alt: 'Generated Radiance Cafe Latte concept tin with flowing lettering, gold lid and a sunburst on its ivory label.' },
    { id: 'sunshine', title: 'Made to catch the light.', label: 'The sunshine', text: 'A delicate sunburst and fine botanical details bring a quiet warmth to the packaging. Small things worth looking a little closer at.', image: './assets/product/detail.webp', alt: 'Generated close-up of the embossed champagne-gold sunburst and textured ivory Radiance concept label.' },
    { id: 'ritual', title: 'A familiar kind of lovely.', label: 'The ritual', text: 'Cafe Latte is our flavour direction: a familiar coffee moment, imagined as part of an everyday nutrition routine.', image: './assets/product/ritual.webp', alt: 'Generated morning still life with a ceramic latte cup, linen and the Radiance Cafe Latte concept tin.' },
  ],
  faqs: [
    { question: 'Who are we creating Radiance for?', answer: 'Radiance is being developed for middle-aged and older men and women living with diabetes who require protein intake. The formulation and its suitability for that audience still need technical evaluation.' },
    { question: 'What is the flavour direction?', answer: 'Cafe Latte. We are exploring the warmth and familiarity of a coffee ritual. The final recipe, taste and preparation instructions are still being developed.' },
    { question: 'How much protein will it contain?', answer: 'The serving size, protein content and full nutrition information have not been finalised. The 500 g size shown on the concept tin is an artwork placeholder.' },
    { question: 'Can I buy Radiance yet?', answer: 'Not yet. This is a product and packaging concept, shared as it takes shape. Formulation, suitability, ingredients, allergen information and final artwork must be confirmed before launch.' },
  ],
} as const;
