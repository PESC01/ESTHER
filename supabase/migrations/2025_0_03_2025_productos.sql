ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_gender_check;

ALTER TABLE products
ADD CONSTRAINT products_gender_check
CHECK (gender IN ('men', 'women', 'cold_weather'));