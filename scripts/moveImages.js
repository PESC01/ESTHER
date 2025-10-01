import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorios si no existen
const imagesDir = path.join(__dirname, '../src/assets/images');
const productsDir = path.join(imagesDir, 'products');

// Solo crear los directorios necesarios
[imagesDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
   
  }
});

