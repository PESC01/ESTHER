import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { X, Phone } from 'lucide-react';
import { useImageUrl } from '../lib/imageUtils';

interface ProductModalProps {
  item: ClothingItem;
  onClose: () => void;
}

// Componente para renderizar cada miniatura
const Thumbnail: React.FC<{ url: string; onClick: () => void; active: boolean; alt: string }> = ({ url, onClick, active, alt }) => {
  const thumbUrl = useImageUrl(url);
  return (
    <img
      src={thumbUrl}
      alt={alt}
      className={`h-16 w-16 object-cover cursor-pointer rounded ${active ? 'border-2 border-black' : 'opacity-75 hover:opacity-100'}`}
      onClick={onClick}
    />
  );
};

export const ProductModal: React.FC<ProductModalProps> = ({ item, onClose }) => {
  const [mainIndex, setMainIndex] = useState(0);
  const mainImageUrl = useImageUrl(item.image_urls[mainIndex] || '');

  // Construye el mensaje con encodeURIComponent
  const message = encodeURIComponent(`Hola! Quisiera realizar un pedido de ${item.name} con un precio de Bs${item.price.toFixed(2)}. Gracias!`);
  // Construye la URL completa de WhatsApp
  const whatsappLink = `https://wa.me/74534873?text=${message}`;

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
          <div className="flex flex-col gap-4">
            <div className="aspect-square">
              <img 
                src={mainImageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Miniaturas */}
            <div className="flex gap-2">
              {item.image_urls.map((url, index) => (
                <Thumbnail 
                  key={index}
                  url={url}
                  alt={`${item.name} miniatura ${index + 1}`}
                  active={index === mainIndex}
                  onClick={() => setMainIndex(index)}
                />
              ))}
            </div>
          </div>
          
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-medium mb-2">{item.name}</h2>
              <p className="text-2xl mb-4">Bs{item.price.toFixed(2)}</p>
              <p className="text-gray-600 mb-6">{item.description}</p>
            </div>
            <a
              href={whatsappLink}
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