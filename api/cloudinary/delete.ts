import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir método DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    console.log('Attempting to delete image with public ID:', publicId);
    
    // Eliminar la imagen de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('Cloudinary delete result:', result);
    
    if (result.result === 'ok' || result.result === 'not found') {
      res.json({ 
        success: true, 
        result: result,
        message: result.result === 'ok' ? 'Image deleted successfully' : 'Image not found (may have been already deleted)'
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to delete image',
        result: result 
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ 
      error: 'Delete failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}