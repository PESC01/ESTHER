/*
  # Add cascade delete for products

  1. Changes
    - Modify foreign key constraint on products table to cascade delete when category is deleted
    
  2. Details
    - When a category is deleted, all associated products will be automatically deleted
    - This prevents foreign key constraint violations
*/

-- First drop the existing foreign key constraint
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Add the new constraint with CASCADE
ALTER TABLE products
ADD CONSTRAINT products_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE CASCADE;