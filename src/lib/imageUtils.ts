import { useState, useEffect } from 'react';
import { fileManager } from './fileManager';

export function getDirectImageUrl(url: string): string {
  // Si es una URL externa (http/https), procesar según el tipo
  if (url.startsWith('http')) {
    // Google Drive
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return url;
  }
  
  // Si es data URL (base64), devolverla directamente
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Si es una ruta local, usar el file manager
  return fileManager.getImageUrl(url);
}

export const useImageUrl = (imagePath: string): string => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!imagePath) {
      setImageUrl('');
      return;
    }

    // Si ya es una URL completa (Cloudinary), usarla directamente
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('URL de Cloudinary detectada:', imagePath);
      setImageUrl(imagePath);
      return;
    }

    // Si no es una URL completa, usar el fileManager
    setLoading(true);
    
    try {
      const url = fileManager.getImageUrl(imagePath);
      setImageUrl(url);
    } catch (error) {
      console.error('Error getting image URL:', error);
      setImageUrl('');
    } finally {
      setLoading(false);
    }
  }, [imagePath]);

  return imageUrl;
};

// Función para validar si un archivo es una imagen válida
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB máximo
  
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  if (file.size > maxSize) {
    alert('El archivo es demasiado grande. Máximo 5MB.');
    return false;
  }
  
  return true;
}

// Función para generar un nombre único para el archivo
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}