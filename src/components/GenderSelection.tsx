import React, { useEffect, useState } from 'react';
import { Gender } from '../types';
import { supabase } from '../lib/supabase';
import { useImageUrl } from '../lib/imageUtils';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

export const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  const [images, setImages] = useState<Record<Gender, string>>({
    women: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2',
    men: 'https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a'
  });

  const womenImageUrl = useImageUrl(images.women);
  const menImageUrl = useImageUrl(images.men);

  useEffect(() => {
    loadSectionImages();
  }, []);

  const loadSectionImages = async () => {
    try {
      const { data } = await supabase
        .from('section_images')
        .select('*');

      if (data) {
        const newImages = { ...images };
        data.forEach(item => {
          if (item.image_url) {
            newImages[item.gender] = item.image_url;
          }
        });
        setImages(newImages);
      }
    } catch (error) {
      console.error('Error loading section images:', error);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div 
        className="relative cursor-pointer group overflow-hidden h-screen"
        onClick={() => onSelect('women')}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <img 
          src={womenImageUrl}
          alt="Women's Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">MUJER</h2>
        </div>
      </div>
      
      <div 
        className="relative cursor-pointer group overflow-hidden h-screen"
        onClick={() => onSelect('men')}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <img 
          src={menImageUrl}
          alt="Men's Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">HOMBRE</h2>
        </div>
      </div>
    </div>
  );
};