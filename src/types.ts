export type Gender = 'women' | 'men';

export interface Category {
  id: string;
  name: string;
  gender: Gender;
  created_at?: string;
  updated_at?: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_urls: string[]; 
  category_id: string;
  gender: Gender;
  created_at?: string;
  updated_at?: string;
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