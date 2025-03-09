import React, { useEffect, useState } from 'react';
import { Gender } from '../types';
import { supabase } from '../lib/supabase';
import { useImageUrl } from '../lib/imageUtils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

export const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  const [images, setImages] = useState<Record<Gender, string>>({
    women: '',
    men: '',
    cold_weather: ''
  });
  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);
  const [showColdWeather, setShowColdWeather] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const womenImageUrl = useImageUrl(images.women);
  const menImageUrl = useImageUrl(images.men);
  const coldWeatherImageUrl = useImageUrl(images.cold_weather);

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
    setHoveredGender(gender);
    setTimeout(() => {
      onSelect(gender);
    }, 200);
  };

  // Manejadores de eventos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX) return;

    const touchEndX = e.touches[0].clientX;
    const difference = touchStartX - touchEndX;

    // Si el usuario desliza desde la derecha hacia la izquierda (diferencia positiva)
    if (difference > 50 && !showColdWeather) {
      setShowColdWeather(true);
    }
    // Si el usuario desliza desde la izquierda hacia la derecha (diferencia negativa)
    else if (difference < -50 && showColdWeather) {
      setShowColdWeather(false);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  // Alternar entre las opciones de género y ropa de frío
  const toggleDisplay = () => {
    setShowColdWeather(prev => !prev);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!showColdWeather ? (
        // Sección con Mujer y Hombre
        <div className="grid grid-cols-2 h-full">
          <div
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => handleSelect('women')}
            onMouseEnter={() => setHoveredGender('women')}
            onMouseLeave={() => setHoveredGender(null)}
          >
            <div className={`absolute inset-0 bg-black transition-all duration-300 ${hoveredGender === 'women' ? 'bg-opacity-20' : 'bg-opacity-0'}`}></div>
            <img
              src={womenImageUrl}
              alt="Women's Collection"
              className={`w-full h-full object-cover transition-transform duration-200 ${hoveredGender === 'women' ? 'scale-105' : ''}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">MUJER</h2>
            </div>
          </div>

          <div
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => handleSelect('men')}
            onMouseEnter={() => setHoveredGender('men')}
            onMouseLeave={() => setHoveredGender(null)}
          >
            <div className={`absolute inset-0 bg-black transition-all duration-300 ${hoveredGender === 'men' ? 'bg-opacity-20' : 'bg-opacity-0'}`}></div>
            <img
              src={menImageUrl}
              alt="Men's Collection"
              className={`w-full h-full object-cover transition-transform duration-200 ${hoveredGender === 'men' ? 'scale-105' : ''}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">HOMBRE</h2>
            </div>
          </div>
        </div>
      ) : (
        // Sección de Ropa de Frío
        <div className="h-full">
          <div
            className="relative cursor-pointer group overflow-hidden h-full"
            onClick={() => handleSelect('cold_weather')}
            onMouseEnter={() => setHoveredGender('cold_weather')}
            onMouseLeave={() => setHoveredGender(null)}
          >
            <div className={`absolute inset-0 bg-black transition-all duration-300 ${hoveredGender === 'cold_weather' ? 'bg-opacity-20' : 'bg-opacity-0'}`}></div>
            <img
              src={coldWeatherImageUrl}
              alt="Cold Weather Collection"
              className="w-full h-full object-cover transition-transform duration-200"
              style={{
                transform: hoveredGender === 'cold_weather' ? 'scale(1.05)' : 'scale(1)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">ROPA DE FRÍO</h2>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para alternar entre vistas */}
      <button
        onClick={toggleDisplay}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-3 text-white hover:bg-opacity-70 transition-all duration-300 focus:outline-none"
        aria-label={showColdWeather ? "Mostrar categorías" : "Ver ropa de frío"}
      >
        {showColdWeather ? (
          <div className="flex flex-col items-center">
            <span className="text-xs text-white mb-1 px-1 hidden sm:block">Categorías</span>
            <ChevronLeft size={24} className="sm:size-32" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-xs text-white mb-1 px-1 hidden sm:block">Ropa de frío</span>
            <ChevronRight size={24} className="sm:size-32" />
          </div>
        )}
      </button>
    </div>
  );
};