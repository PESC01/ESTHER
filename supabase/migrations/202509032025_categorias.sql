-- Eliminar la restricción actual
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_gender_check;

-- Añadir una nueva restricción que incluya 'cold_weather'
ALTER TABLE categories
ADD CONSTRAINT categories_gender_check
CHECK (gender IN ('men', 'women', 'cold_weather'));