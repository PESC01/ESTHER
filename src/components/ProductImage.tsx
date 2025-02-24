import React from 'react';
import { useImageUrl } from '../lib/imageUtils';

interface ProductImageProps {
  imageUrl: string;
  alt: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, alt }) => {
  const directImageUrl = useImageUrl(imageUrl);

  return <img src={directImageUrl} alt={alt} className="h-12 w-12 object-cover rounded" />;
};