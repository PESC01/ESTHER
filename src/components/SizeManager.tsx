import React from 'react';
import { Size } from '../types';

interface SizeManagerProps {
  sizes: Size[];
  onSizesChange: (sizes: Size[]) => void;
}

const AVAILABLE_SIZES: Size['name'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const SizeManager: React.FC<SizeManagerProps> = ({ sizes, onSizesChange }) => {
  const toggleSize = (sizeName: Size['name']) => {
    const existingSize = sizes.find(s => s.name === sizeName);
    
    if (existingSize) {
      // Remover la talla
      onSizesChange(sizes.filter(s => s.name !== sizeName));
    } else {
      // Agregar la talla
      const newSize: Size = {
        id: Date.now().toString(),
        name: sizeName
      };
      onSizesChange([...sizes, newSize]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Tallas Disponibles</label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SIZES.map((sizeName) => {
          const isSelected = sizes.some(s => s.name === sizeName);
          return (
            <button
              key={sizeName}
              type="button"
              onClick={() => toggleSize(sizeName)}
              className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {sizeName}
            </button>
          );
        })}
      </div>
      {sizes.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Tallas seleccionadas:</strong> {sizes.map(s => s.name).join(', ')}
        </div>
      )}
    </div>
  );
};