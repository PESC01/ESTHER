import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { X, Phone, Heart } from 'lucide-react';
import { useImageUrl } from '../lib/imageUtils';

interface ProductModalProps {
  item: ClothingItem;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

// Componente para renderizar cada miniatura
const Thumbnail: React.FC<{ url: string; onClick: () => void; active: boolean; alt: string }> = ({ url, onClick, active, alt }) => {
  const thumbUrl = useImageUrl(url);
  return (
    <img
      src={thumbUrl}
      alt={alt}
      className={`h-12 w-12 sm:h-16 sm:w-16 object-cover cursor-pointer rounded ${active ? 'border-2 border-black' : 'opacity-75 hover:opacity-100'}`}
      onClick={onClick}
    />
  );
};

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  onClose,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [mainIndex, setMainIndex] = useState(0);
  const mainImageUrl = useImageUrl(item.image_urls[mainIndex] || '');

  // Construye el mensaje con encodeURIComponent
  const message = encodeURIComponent(`Hola! Quisiera realizar un pedido de ${item.name} con un precio de ${item.price.toFixed(2)} Bs. Gracias!`);
  // Construye la URL completa de WhatsApp
  const whatsappLink = `https://wa.me/74534873?text=${message}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden relative my-2 sm:my-0">
        {/* Controles superiores */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(e, item.id)}
              className="p-3 sm:p-2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full z-50 shadow-lg"
              aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-700'}`} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-3 sm:p-2 bg-black bg-opacity-70 hover:bg-opacity-100 text-white rounded-full z-50 shadow-lg"
            aria-label="Cerrar"
            style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Columna de imágenes */}
          <div className="flex flex-col gap-2 sm:gap-4 p-4 pt-12 sm:pt-10 sm:p-6">
            <div className="aspect-square w-full">
              <img
                src={mainImageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Miniaturas - scrollable en móvil */}
            <div className="flex gap-2 overflow-x-auto pb-2">
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

          {/* Columna de información */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-medium mb-2">{item.name}</h2>
              <p className="text-xl sm:text-2xl mb-3 sm:mb-4">{item.price.toFixed(2)} Bs</p>
              <p className="text-gray-600 mb-4 sm:mb-6">{item.description}</p>
            </div>
            <div className="w-full pb-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Realizar Pedido
              </a>
            </div>

            {/* Botón adicional para cerrar en la parte inferior (solo en móvil) */}
            <div className="mt-4 block md:hidden">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};