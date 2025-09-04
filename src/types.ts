export type Gender = 'women' | 'men' | 'cold_weather';

export interface Category {
  id: string;
  name: string;
  gender: Gender;
  created_at?: string;
  updated_at?: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  image_urls: string[];
}

export interface Size {
  id: string;
  name: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
}

export interface ClothingItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_urls: string[];
  category_id: string;
  gender: Gender;
  colors: Color[];
  sizes: Size[];
}

export interface SectionImage {
  id: string;
  gender: Gender;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
}