import React from 'react';
import { ClothingItem } from '../types';
import { useImageUrl } from '../lib/imageUtils';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  item: ClothingItem;
  onClick?: (item: ClothingItem) => void; // Hacer onClick opcional
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, isFavorite, onToggleFavorite }) => {
  
  // Lógica para obtener la URL de la imagen a mostrar
  const getDisplayImageUrl = (product: ClothingItem): string => {
    // 1. Usar la primera imagen general si existe
    if (product.image_urls && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    // 2. Si no, buscar el primer color que tenga imágenes
    if (product.colors && product.colors.length > 0) {
      const firstColorWithImages = product.colors.find(c => c.image_urls && c.image_urls.length > 0);
      if (firstColorWithImages) {
        return firstColorWithImages.image_urls[0];
      }
    }
    // 3. Fallback a una cadena vacía si no hay ninguna imagen
    return '';
  };

  const imageUrl = useImageUrl(getDisplayImageUrl(item));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(e, item.id);
  };

  return (
    <div
      className="group cursor-pointer flex flex-col relative"
      // Llamar onClick sólo si fue provisto (evita error cuando se renderiza dentro de un <Link>)
      onClick={() => onClick?.(item)}
    >
      {/* Botón de favoritos */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 z-10 p-2 bg-white bg-opacity-70 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
        aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
        />
      </button>

      <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-md">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm md:text-base font-medium truncate">{item.name}</h3>
        <p className="text-gray-900 font-medium font-numbers">{item.price.toFixed(2)} Bs</p>
      </div>
    </div>
  );
};