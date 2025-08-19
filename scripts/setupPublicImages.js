import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorios en public para que Vite los sirva
const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');
const productsDir = path.join(imagesDir, 'products');

// Crear los directorios necesarios
[publicDir, imagesDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});

// Crear archivo .gitkeep para mantener las carpetas en git
const gitkeepPath = path.join(productsDir, '.gitkeep');
fs.writeFileSync(gitkeepPath, '');

console.log('Estructura de directorios para imágenes públicas creada correctamente');
console.log('Las imágenes se servirán desde: /images/products/');