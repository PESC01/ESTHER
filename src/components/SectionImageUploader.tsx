import React, { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { isValidImageFile } from '../lib/imageUtils';
import { uploadToCloudinary } from '../lib/cloudinaryConfig';
import { fileManager } from '../lib/fileManager';

interface SectionImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label: string;
  description?: string;
}

export const SectionImageUploader: React.FC<SectionImageUploaderProps> = ({
  onImageUpload,
  currentImage,
  label,
  description
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!isValidImageFile(file)) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, WebP)');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Subir a Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file, 'esther/sections');
      
      onImageUpload(cloudinaryUrl);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error subiendo archivo a Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      // COMENTADO: No eliminar de Cloudinary automáticamente
      // if (currentImage.includes('cloudinary.com')) {
      //   try {
      //     await fileManager.deleteFile(currentImage);
      //     console.log('Imagen de sección eliminada de Cloudinary:', currentImage);
      //   } catch (error) {
      //     console.warn('Error eliminando imagen de sección de Cloudinary:', error);
      //   }
      // }
      
      // Solo limpiar la imagen de la UI
      console.log('Imagen de sección removida (permanece en Cloudinary):', currentImage);
      onImageUpload('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* Vista previa de imagen actual */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-md border"
            onError={(e) => {
              console.error('Error cargando imagen:', currentImage);
            }}
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            title="Eliminar imagen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}
        ${uploadSuccess ? 'border-green-500 bg-green-50' : ''}`}
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
          onChange={handleFileInput}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-')}`}
          disabled={uploading}
        />
        
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="text-sm text-gray-600">Subiendo a Cloudinary...</span>
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600">¡Imagen subida exitosamente!</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {currentImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </span>
              <span className="text-xs text-gray-400">
                Solo archivos JPG, PNG, GIF o WebP
              </span>
            </>
          )}
        </label>
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-500">
        <p>• Las imágenes se guardan en Cloudinary</p>
        <p>• Tamaño máximo: 10MB por imagen</p>
      </div>
    </div>
  );
};