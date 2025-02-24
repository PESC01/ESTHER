/*
  # Initial Schema Setup for ESTHER Clothing Store

  1. New Tables
    - `section_images`: Stores hero images for men's and women's sections
      - `id` (uuid, primary key)
      - `gender` (text): 'men' or 'women'
      - `image_url` (text): URL of the hero image
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `categories`: Stores clothing categories
      - `id` (uuid, primary key)
      - `name` (text): Category name
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products`: Stores clothing items
      - `id` (uuid, primary key)
      - `name` (text): Product name
      - `price` (numeric): Product price
      - `description` (text): Product description
      - `image_url` (text): Product image URL
      - `category_id` (uuid): Foreign key to categories
      - `gender` (text): 'men' or 'women'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
    - Add policies for anonymous users to read data
*/

-- Create section_images table
CREATE TABLE section_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gender text NOT NULL CHECK (gender IN ('men', 'women')),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  description text,
  image_url text NOT NULL,
  category_id uuid REFERENCES categories(id),
  gender text NOT NULL CHECK (gender IN ('men', 'women')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE section_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for section_images
CREATE POLICY "Allow anonymous read access to section_images"
  ON section_images
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to manage section_images"
  ON section_images
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for categories
CREATE POLICY "Allow anonymous read access to categories"
  ON categories
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for products
CREATE POLICY "Allow anonymous read access to products"
  ON products
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to manage products"
  ON products
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_section_images_updated_at
  BEFORE UPDATE ON section_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();