import React from 'react';

interface ProductImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, alt, className = "h-12 w-12 object-cover rounded" }) => {
  // Si la imagen empieza con http/https, es una URL externa
  // Si no, es una imagen local del proyecto
  const imageSrc = imageUrl.startsWith('http') 
    ? imageUrl 
    : `/src/assets/images/${imageUrl}`;

  return <img src={imageSrc} alt={alt} className={className} />;
};