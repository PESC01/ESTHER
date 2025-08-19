import { uploadToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } from './cloudinaryConfig';

class FileManager {
  private useCloudinary = true;

  async saveFile(file: File, path: string): Promise<string> {
    try {
      const folder = path.includes('products') ? 'esther/products' : 'esther/sections';
      const cloudinaryUrl = await uploadToCloudinary(file, folder);
      return cloudinaryUrl;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  async deleteFile(pathOrUrl: string): Promise<void> {
    if (pathOrUrl.includes('cloudinary.com')) {
      try {
        const publicId = getPublicIdFromUrl(pathOrUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
          console.log('Imagen eliminada exitosamente de Cloudinary');
        } else {
          throw new Error('No se pudo extraer el public ID de la URL');
        }
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        
        // En desarrollo, solo advertir pero no bloquear la operación
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
          console.warn('⚠️ Desarrollo: La imagen no se eliminó de Cloudinary, pero la operación continuará');
          console.warn('Para eliminar imágenes en desarrollo, configura VITE_VERCEL_URL en tu .env');
          // No lanzar error en desarrollo
          return;
        } else {
          // En producción, sí lanzar el error
          throw new Error(`Error eliminando imagen de Cloudinary: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }
  }

  getImageUrl(pathOrUrl: string): string {
    return pathOrUrl;
  }
}

export const fileManager = new FileManager();