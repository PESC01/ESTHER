import React, { useState, useRef, useEffect } from 'react';
import { Color } from '../types';
import { Plus, X, Upload } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface ColorManagerProps {
  colors: Color[];
  onColorsChange: (colors: Color[]) => void;
}

export const ColorManager: React.FC<ColorManagerProps> = ({ colors, onColorsChange }) => {
  const [newColor, setNewColor] = useState({ name: '', hex_code: '#000000' });
  const [newColorImages, setNewColorImages] = useState<string[]>([]);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingColorImages, setEditingColorImages] = useState<string[]>([]);

  // IDs únicos y estables para los uploaders (evitan colisiones dentro del form)
  const newColorUploaderIdRef = useRef(`file-upload-newcolor-${Math.random().toString(36).slice(2,8)}`);
  const editingUploaderIdRef = useRef(`file-upload-editcolor-${Math.random().toString(36).slice(2,8)}`);

  const addColor = () => {
    if (newColor.name.trim()) {
      const color: Color = {
        id: Date.now().toString(),
        name: newColor.name.trim(),
        hex_code: newColor.hex_code,
        image_urls: newColorImages || []
      };
      onColorsChange([...colors, color]);
      setNewColor({ name: '', hex_code: '#000000' });
      setNewColorImages([]);
      // regenerar id para evitar reuse accidental (opcional)
      newColorUploaderIdRef.current = `file-upload-newcolor-${Math.random().toString(36).slice(2,8)}`;
    }
  };

  const removeColor = (colorId: string) => {
    onColorsChange(colors.filter(c => c.id !== colorId));
  };

  const startEditingImages = (color: Color) => {
    setEditingColorId(color.id);
    setEditingColorImages(color.image_urls || []);
  };

  const saveColorImages = () => {
    if (editingColorId) {
      const updatedColors = colors.map(color => 
        color.id === editingColorId 
          ? { ...color, image_urls: editingColorImages }
          : color
      );
      onColorsChange(updatedColors);
      setEditingColorId(null);
      setEditingColorImages([]);
    }
  };

  const cancelEditingImages = () => {
    setEditingColorId(null);
    setEditingColorImages([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Colores</h3>
      </div>

      {/* Agregar nuevo color (ahora permite subir imágenes antes de "Agregar") */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del color"
            value={newColor.name}
            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
          />
          <input
            type="color"
            value={newColor.hex_code}
            onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <button
            type="button"
            onClick={addColor}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            title="Agregar color (las imágenes subidas se adjuntarán al color)"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {/* Uploader para las imágenes del nuevo color — opcional: puedes añadir imágenes antes de agregar el color */}
        <div>
          <ImageUploader
            inputId={newColorUploaderIdRef.current}
            label="Imágenes (opcional) para este color"
            onImageUpload={(imagePath) => setNewColorImages(prev => [...prev, imagePath])}
            onImageRemove={(imagePath) => setNewColorImages(prev => prev.filter(url => url !== imagePath))}
            currentImages={newColorImages}
            maxImages={8}
          />
        </div>
      </div>

      {/* Lista de colores */}
      <div className="space-y-2">
        {colors.map((color) => (
          <div key={color.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color.hex_code }}
              />
              <span className="font-medium">{color.name}</span>
              <span className="text-sm text-gray-500">
                {color.image_urls?.length || 0} imágenes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEditingImages(color)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Imágenes
              </button>
              <button
                type="button"
                onClick={() => removeColor(color.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar imágenes del color */}
      {editingColorId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              Imágenes para {colors.find(c => c.id === editingColorId)?.name}
            </h3>
            
            <ImageUploader
              inputId={`${editingUploaderIdRef.current}-${editingColorId}`}
              label="Imágenes del color"
              onImageUpload={(imagePath) => {
                setEditingColorImages(prev => [...prev, imagePath]);
              }}
              onImageRemove={(imagePath) => {
                setEditingColorImages(prev => prev.filter(url => url !== imagePath));
              }}
              currentImages={editingColorImages}
              maxImages={10}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={cancelEditingImages}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveColorImages}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};