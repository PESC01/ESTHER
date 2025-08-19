import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { isValidImageFile } from '../lib/imageUtils';
import { uploadToCloudinary } from '../lib/cloudinaryConfig';
import { fileManager } from '../lib/fileManager';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  onImageRemove?: (url: string) => void;
  currentImages: string[];
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onImageRemove,
  currentImages = [],
  maxImages = 5
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(isValidImageFile);
    
    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos de imagen válidos (JPG, PNG, GIF, WebP)');
      return;
    }

    if (currentImages.length + validFiles.length > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      return;
    }

    setUploading(true);

    for (const file of validFiles) {
      try {
        // Subir a Cloudinary en la carpeta de productos
        const cloudinaryUrl = await uploadToCloudinary(file, 'esther/products');
        onImageUpload(cloudinaryUrl);
      } catch (error) {
        console.error('Error subiendo archivo:', error);
        alert('Error subiendo archivo: ' + file.name);
      }
    }

    setUploading(false);
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (onImageRemove) {
      // Eliminar de Cloudinary si es una URL de Cloudinary
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        try {
          await fileManager.deleteFile(imageUrl);
          console.log('Imagen eliminada de Cloudinary:', imageUrl);
        } catch (error) {
          console.warn('Error eliminando imagen de Cloudinary:', error);
          // Continuar con la eliminación de la UI aunque falle la eliminación de Cloudinary
        }
      }
      
      onImageRemove(imageUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="text-sm text-gray-600">Subiendo a Cloudinary...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Arrastra imágenes aquí o haz clic para seleccionar
              </span>
              <span className="text-xs text-gray-400">
                Máximo {maxImages} imágenes (JPG, PNG, GIF, WebP)
              </span>
            </>
          )}
        </label>
      </div>

      {/* Vista previa de imágenes actuales */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                onClick={() => handleRemoveImage(imageUrl)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};