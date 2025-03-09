import React, { useEffect, useState } from 'react';
import { Gender } from '../types';
import { supabase } from '../lib/supabase';
import { useImageUrl } from '../lib/imageUtils';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

export const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  const [images, setImages] = useState<Record<Gender, string>>({
    women: '',
    men: ''
  });
  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);

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
            newImages[item.gender as Gender] = item.image_url;
          }
        });
        setImages(newImages);
      }
    } catch (error) {
      console.error('Error loading section images:', error);
    }
  };

  const handleSelect = (gender: Gender) => {
    // Efecto visual antes de la selección
    setHoveredGender(gender);
    setTimeout(() => {
      onSelect(gender);
    }, 200); // Pequeño retraso para mostrar el efecto
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div
        className="relative cursor-pointer group overflow-hidden h-screen"
        onClick={() => handleSelect('women')}
        onMouseEnter={() => setHoveredGender('women')}
        onMouseLeave={() => setHoveredGender(null)}
      >
        {/* Capa transparente inicialmente, visible solo al hover o al clic */}
        <div className={`absolute inset-0 bg-black transition-all duration-300 ${hoveredGender === 'women' ? 'bg-opacity-20' : 'bg-opacity-0'
          }`}></div>
        <img
          src={womenImageUrl}
          alt="Women's Collection"
          className={`w-full h-full object-contain transition-transform duration-200 ${hoveredGender === 'women' ? 'scale-105' : ''
            }`}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">MUJER</h2>
        </div>
      </div>

      <div
        className="relative cursor-pointer group overflow-hidden h-screen"
        onClick={() => handleSelect('men')}
        onMouseEnter={() => setHoveredGender('men')}
        onMouseLeave={() => setHoveredGender(null)}
      >
        {/* Capa transparente inicialmente, visible solo al hover o al clic */}
        <div className={`absolute inset-0 bg-black transition-all duration-300 ${hoveredGender === 'men' ? 'bg-opacity-20' : 'bg-opacity-0'
          }`}></div>
        <img
          src={menImageUrl}
          alt="Men's Collection"
          className={`w-full h-full object-contain transition-transform duration-200 ${hoveredGender === 'men' ? 'scale-105' : ''
            }`}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">HOMBRE</h2>
        </div>
      </div>
    </div>
  );
};