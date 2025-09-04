import React, { useState, useEffect } from 'react';
import { ClothingItem, Color, Size } from '../types';
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
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  // Lógica para elegir qué imágenes mostrar:
  // - Si se ha seleccionado un color => mostrar las imágenes de ese color (si las tiene).
  // - Si NO hay color seleccionado y existen image_urls generales del producto => mostrar las generales.
  // - Si NO hay image_urls generales => mostrar las imágenes del primer color que tenga imágenes.
  const displayImages = React.useMemo(() => {
    // Si hay color seleccionado y tiene imágenes -> prioridad al color seleccionado
    if (selectedColor && selectedColor.image_urls && selectedColor.image_urls.length > 0) {
      return selectedColor.image_urls;
    }

    // Si no hay color seleccionado y existen imágenes generales -> mostrarlas
    if (item.image_urls && item.image_urls.length > 0 && !selectedColor) {
      return item.image_urls;
    }

    // Si no hay imágenes generales -> buscar el primer color con imágenes
    if (item.colors && item.colors.length > 0) {
      const firstColorWithImages = item.colors.find(c => c.image_urls && c.image_urls.length > 0);
      if (firstColorWithImages) {
        return firstColorWithImages.image_urls;
      }
      // Si ningún color tiene imágenes, intentar usar las imágenes del primer color (aunque vacías)
      return item.colors[0].image_urls || [];
    }

    // Fallback
    return item.image_urls || [];
  }, [selectedColor, item.image_urls, item.colors]);

  // Ajustar mainIndex cuando cambien las imágenes a mostrar
  useEffect(() => {
    if (mainIndex >= displayImages.length) {
      setMainIndex(0);
    }
  }, [displayImages, mainIndex]);

  // Inicializar selectedColor sólo si NO hay imágenes generales.
  useEffect(() => {
    if (item && (!item.image_urls || item.image_urls.length === 0) && item.colors && item.colors.length > 0) {
      const firstColorWithImages = item.colors.find(color => color.image_urls && color.image_urls.length > 0);
      if (firstColorWithImages) {
        setSelectedColor(firstColorWithImages);
      } else {
        // No hay imágenes en colores pero seleccionar el primer color para que el selector funcione
        setSelectedColor(item.colors[0]);
      }
    } else {
      // Si existen imágenes generales, no seleccionar color por defecto
      setSelectedColor(null);
    }
  }, [item]);

  // Resetear índice principal cuando el color seleccionado cambie
  useEffect(() => {
    setMainIndex(0);
  }, [selectedColor]);

  const mainImageUrl = useImageUrl(displayImages[mainIndex] || '');

  // Construye el mensaje con la información de color y talla
  const getOrderMessage = () => {
    let message = `Hola! Quisiera realizar un pedido de ${item.name} con un precio de ${item.price.toFixed(2)} Bs.`;
    
    if (selectedColor) {
      message += ` Color: ${selectedColor.name}.`;
    }
    
    if (selectedSize) {
      message += ` Talla: ${selectedSize.name}.`;
    }
    
    message += ' Gracias!';
    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/74534873?text=${getOrderMessage()}`;

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
            {displayImages.length > 0 ? (
              <>
                <div className="aspect-square w-full">
                  <img
                    src={mainImageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Miniaturas - Solo mostrar si hay más de una imagen */}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {displayImages.map((url, index) => (
                      <Thumbnail
                        key={`${selectedColor?.id || 'default'}-${index}`}
                        url={url}
                        alt={`${item.name} miniatura ${index + 1}`}
                        active={index === mainIndex}
                        onClick={() => setMainIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Sin imagen disponible</span>
              </div>
            )}
          </div>

          {/* Columna de información */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-medium mb-2">{item.name}</h2>
              <p className="text-xl sm:text-2xl mb-3 sm:mb-4 font-numbers">{item.price.toFixed(2)} Bs</p>
              <p className="text-gray-600 mb-4 sm:mb-6">{item.description}</p>

              {/* Selector de colores */}
              {item.colors && item.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color: {selectedColor?.name || 'Selecciona un color'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {item.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => {
                          setSelectedColor(color);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor?.id === color.id
                            ? 'border-black scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de tallas */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Talla: {selectedSize?.name || 'Selecciona una talla'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedSize?.id === size.id
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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