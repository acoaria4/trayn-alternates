// Add a concept here after its page and assets exist. Paths are relative to the picker.
type ProductConcept = {
  id: string; title: string; href: string; image: string; imageLarge: string;
  imageAlt: string; audience: string; description: string; protein: string;
  base: string; occasion: string; status: string; action: string;
  imageNote?: string;
};

export const concepts: readonly ProductConcept[] = [
  {
    id: 'nurture-v01',
    title: 'Nurture v01',
    href: './nurture-v01/',
    image: './nurture-v01/assets/product/hero-small.webp',
    imageLarge: './nurture-v01/assets/product/hero.webp',
    imageAlt: 'Generated cream-and-gold Nurture packaging concept',
    audience: 'For working women aged 25–45',
    description: 'A morning cup with protein and selected micronutrients. An everyday ritual, thoughtfully reconsidered.',
    protein: '15 g protein target',
    base: 'MPC-led dairy',
    occasion: 'Morning coffee',
    status: 'In development',
    action: 'Explore Nurture',
  },
  {
    id: 'radiance-v01',
    title: 'Radiance v01',
    href: './radiance-v01/',
    image: './radiance-v01/assets/product/packaging-600.webp',
    imageLarge: './radiance-v01/assets/product/packaging.webp',
    imageAlt: 'Generated ivory-and-gold Radiance Cafe Latte concept tin',
    audience: 'For middle-aged and older men & women living with diabetes',
    description: 'A little sunshine. Every day. A Cafe Latte protein concept, imagined for a comforting everyday ritual.',
    protein: 'Formulation in development',
    base: 'Cafe Latte protein concept',
    occasion: 'An everyday coffee moment',
    status: 'In development',
    action: 'Discover Radiance',
  },
  {
    id: 'radiance-v03',
    title: 'Radiance v03',
    href: './radiance-v03/',
    image: './radiance-v03/assets/world/latte-world-800.webp',
    imageLarge: './radiance-v03/assets/world/latte-world.webp',
    imageAlt: 'Generated surreal Cafe Latte world with a floating ivory cup and a ribbon of gold',
    imageNote: 'Generated campaign concept',
    audience: 'For middle-aged and older men & women living with diabetes',
    description: 'Everyday. Reimagined. Surreal sunlit landscapes, oversized typography, cinematic product scenes and an interactive world of fireflies.',
    protein: 'Formulation in development',
    base: 'Cafe Latte protein concept',
    occasion: 'An everyday coffee moment',
    status: 'In development',
    action: 'Explore Radiance v03',
  },
];
