import React from 'react';
import { ClothingItem } from '../types';
import { useImageUrl } from '../lib/imageUtils';

interface ProductCardProps {
  item: ClothingItem;
  onClick: (item: ClothingItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick }) => {
  const mainImageUrl = useImageUrl(item.image_urls[0] || '');

  return (
    <div
      className="group cursor-pointer flex flex-col"
      onClick={() => onClick(item)}
    >
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