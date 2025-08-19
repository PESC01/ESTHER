import React from 'react';
import { ClothingItem } from '../types';
import { useImageUrl } from '../lib/imageUtils';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  item: ClothingItem;
  onClick: (item: ClothingItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onClick,
  isFavorite,
  onToggleFavorite
}) => {
  const mainImageUrl = useImageUrl(item.image_urls[0] || '');

  return (
    <div
      className="group cursor-pointer flex flex-col relative"
      onClick={() => onClick(item)}
    >
      {/* Botón de favoritos */}
      <button
        onClick={(e) => onToggleFavorite(e, item.id)}
        className="absolute top-2 right-2 z-10 p-2 bg-white bg-opacity-70 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
        aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
        />
      </button>

      <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-md">
        <img
          src={mainImageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm md:text-base font-medium truncate">{item.name}</h3>
        <p className="text-sm md:text-base font-semibold">{item.price.toFixed(2)} Bs</p>
      </div>
    </div>
  );
};