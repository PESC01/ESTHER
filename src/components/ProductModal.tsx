import React from 'react';
import { ClothingItem } from '../types';
import { X, Phone } from 'lucide-react';
import { useImageUrl } from '../lib/imageUtils';

interface ProductModalProps {
  item: ClothingItem;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ item, onClose }) => {
  const imageUrl = useImageUrl(item.image_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-2xl w-full rounded-lg overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square">
            <img 
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-medium mb-2">{item.name}</h2>
            <p className="text-2xl mb-4">${item.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-6">{item.description}</p>
            
      
<a
  href={`https://wa.me/61671615?text=Hola!%20Quisiera%20realizar%20un%20pedido%20de%20${item.name}%20con%20un%20precio%20de%20%24${item.price.toFixed(2)}.%20Gracias!`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
>
  <Phone className="w-5 h-5" />
  Realizar Pedido
</a>

          </div>
        </div>
      </div>
    </div>
  );
};