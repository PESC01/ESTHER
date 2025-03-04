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
      className="group cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img 
          src={mainImageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-medium">{item.name}</h3>
        <p className="text-lg">Bs{item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};