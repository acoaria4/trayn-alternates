export interface ProductVariant { id: string; name: string; image: string | null; }
export interface ProductSpecification { label: string; value: string; }
export interface ProductTestimonial { quote: string; author: string; sourceUrl: string; }
export interface LaunchData {
  commerce: { price: number | null; currency: string | null; checkoutUrl: string | null; inventory: number | null };
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  testimonials: ProductTestimonial[];
}

