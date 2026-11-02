import { type LaunchData } from './launch';
export const product = {
  id: 'nurture-everyday',
  name: 'Nurture Everyday',
  brand: 'TRAYN Nutrition',
  stage: 'concept' as const,
  positioning: 'Everyday Nutrition for Every Woman',
  packWeight: '400g',
  tagline: 'To Feel Strong. To Live Well. Every Day.',
  media: {
    hero: './assets/product/hero.webp',
    heroSmall: './assets/product/hero-small.webp',
    heroMobile: './assets/product/hero-mobile.webp',
    heroMobileSmall: './assets/product/hero-mobile-small.webp',
    front: './assets/product/front.webp',
    frontSmall: './assets/product/front-small.webp',
    frontMobile: './assets/product/front-mobile.webp',
    frontMobileSmall: './assets/product/front-mobile-small.webp',
    ritual: './assets/product/ritual.webp',
    ritualSmall: './assets/product/ritual-small.webp',
    detail: './assets/product/finish-angle.webp',
    detailSmall: './assets/product/finish-angle-small.webp',
    artwork: './assets/product/artwork.webp',
    artworkSmall: './assets/product/artwork-small.webp',
  },
  gallery: [
    { id: 'angle', label: 'The silhouette', source: './assets/product/hero.webp', small: './assets/product/hero-small.webp', width: 1000, height: 1500, alt: 'Generated three-quarter concept view of the Nurture Everyday cream tin and gold lid', caption: 'A familiar shape. A considered presence.', note: 'Three-quarter view', cutout: true },
    { id: 'front', label: 'The artwork', source: './assets/product/front.webp', small: './assets/product/front-small.webp', width: 1000, height: 1500, alt: 'Generated front concept view of the Nurture Everyday botanical packaging artwork', caption: 'Everyday care, written into the details.', note: 'Front view', cutout: true },
    { id: 'open', label: 'The inside', source: './assets/product/open.webp', small: './assets/product/open-small.webp', width: 1000, height: 1250, alt: 'Generated concept of the upright empty tin with its gold lid resting beside it', caption: 'A closer look at the packaging concept.', note: 'Open-lid study · contents not shown', cutout: false },
    { id: 'top', label: 'The finishing touch', source: './assets/product/top.webp', small: './assets/product/top-small.webp', width: 1000, height: 1000, alt: 'Generated overhead concept study of the complete circular champagne-gold lid', caption: 'A quiet contrast of cream and gold.', note: 'Top view', cutout: false },
  ],
  // Launch-only information. Null means unconfirmed; do not render guesses.
  commerce: { price: null, currency: null, checkoutUrl: null, inventory: null } as LaunchData['commerce'],
  variants: [] as LaunchData['variants'],
  specifications: [] as LaunchData['specifications'],
  testimonials: [] as LaunchData['testimonials'],
};

export const navigation = [
  { href: '#intention', label: 'The intention' },
  { href: '#object', label: 'The object' },
  { href: '#details', label: 'The details' },
];

export const questions = [
  { question: 'What is Nurture Everyday?', answer: 'A nutrition product concept by TRAYN Nutrition, built around the idea of everyday care for women. The supplied packaging describes it as “Everyday Nutrition for Every Woman.” This is an introduction to the vision and packaging design; the final product is still in development.' },
  { question: 'Can I buy it yet?', answer: 'Nurture Everyday is not available to purchase through this website. A launch date, price, and ordering details will be shared when they are confirmed.' },
  { question: 'What will be inside?', answer: 'The final formulation, complete ingredients, allergens, and nutrition information have not yet been confirmed. The concept artwork is a design reference. Final product information will be published with the approved label.' },
  { question: 'Is this the final packaging?', answer: 'These are generated packaging concepts. The reference artwork shows a 400g tin, but final artwork and packaging dimensions may change. The images do not show a manufactured product.' },
  { question: 'How can I keep up with the launch?', answer: 'Return to this website for confirmed product information. An email signup will be introduced once a launch update service and its privacy information are in place.' },
];

export const imageDisclosure = 'All product views on this page are generated concept images based on the supplied packaging reference. They do not show a manufactured product. Final packaging, formulation and approved product information may change.';
