export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dd8hdmg6r',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'esther_unsigned'
};

export const uploadToCloudinary = async (file: File, folder: string = 'esther'): Promise<string> => {
  // Validar configuración
  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
    throw new Error('Cloudinary no está configurado correctamente. Verifica las variables de entorno.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);



  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error en la respuesta de Cloudinary: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    
    return data.secure_url;
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    throw error;
  }
};

// Función para extraer el public_id de una URL de Cloudinary
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // Ejemplo de URL: https://res.cloudinary.com/dd8hdmg6r/image/upload/v1755569051/esther/products/abc123.png
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Obtener la parte después de upload/v{version}/
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
    
    // Remover la extensión del archivo
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
    
   
    return publicId;
  } catch (error) {

    return null;
  }
};

// Función para eliminar imágenes de Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (!publicId) {
      throw new Error('Public ID es requerido');
    }

   

    // Detectar si estamos en desarrollo o producción
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let apiUrl: string;
    if (isDevelopment) {
      const deployUrl = import.meta.env.VITE_VERCEL_URL || import.meta.env.VITE_DEPLOY_URL;
      if (deployUrl) {
        apiUrl = `https://${deployUrl}/api/cloudinary/delete`;
      } else {
        throw new Error('Eliminación de Cloudinary no disponible en desarrollo local. Configura VITE_VERCEL_URL en tu .env');
      }
    } else {
      apiUrl = '/api/cloudinary/delete';
    }

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });


    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Intentar parsear como JSON si es posible
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Error eliminando de Cloudinary: ${response.status} - ${errorData.error || errorData.details || errorText}`);
      } catch (parseError) {
        throw new Error(`Error eliminando de Cloudinary: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
  

    if (!result.success) {
      throw new Error(result.error || 'Error desconocido eliminando imagen');
    }
  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error);
    throw error;
  }
};