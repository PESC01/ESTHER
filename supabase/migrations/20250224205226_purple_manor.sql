/*
  # Add gender column to categories table

  1. Changes
    - Add gender column to categories table
    - Set default gender for existing records
    - Add check constraint for valid gender values

  2. Security
    - No changes to RLS policies needed
*/

-- Add gender column with check constraint
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'women'
CHECK (gender IN ('men', 'women'));

-- Update existing records to have a default gender
UPDATE categories SET gender = 'women' WHERE gender IS NULL;