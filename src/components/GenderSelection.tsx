import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Gender } from '../types';
import { useImageUrl } from '../lib/imageUtils';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';

const SECTION_IMAGES_CACHE_KEY = 'section_images_cache';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

export const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  const [images, setImages] = useState<Record<Gender | 'main_banner', string>>({
    women: '',
    men: '',
    cold_weather: '',
    main_banner: '',
  });
  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);
  const [showColdWeather, setShowColdWeather] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<Gender | 'main_banner', boolean>>({
    women: false,
    men: false,
    cold_weather: false,
    main_banner: false,
  });
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const womenImageUrl = useImageUrl(images.women);
  const menImageUrl = useImageUrl(images.men);
  const coldWeatherImageUrl = useImageUrl(images.cold_weather);
  const mainBannerUrl = useImageUrl(images.main_banner);

  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSectionImages();
  }, []);

  const getCachedImages = (): Record<Gender | 'main_banner', string> | null => {
    try {
      const cachedData = localStorage.getItem(SECTION_IMAGES_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error recuperando imágenes del caché:', error);
      return null;
    }
  }

  const cacheImages = (imageUrls: Record<Gender | 'main_banner', string>) => {
    try {
      localStorage.setItem(SECTION_IMAGES_CACHE_KEY, JSON.stringify(imageUrls));
    } catch (error) {
      console.error('Error guardando imágenes en caché:', error);
    }
  }

  const preloadImages = (imageUrls: Record<Gender | 'main_banner', string>) => {
    setIsLoadingImages(true);

    const preloadPromises = Object.entries(imageUrls).map(([gender, url]) => {
      if (!url) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [gender]: true }));
          resolve();
        };
        img.onerror = () => {
          resolve(); 
        };
        img.src = url;
      });
    });

    Promise.all(preloadPromises).then(() => {
      setIsLoadingImages(false);
    });
  };

  const loadSectionImages = async () => {
    try {
      const { data, error } = await supabase
        .from('section_images')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newImages = {
          women: '',
          men: '',
          cold_weather: '',
          main_banner: ''
        };
        
        data.forEach(item => {
          if (item.image_url && (item.gender in newImages)) {
            newImages[item.gender as Gender | 'main_banner'] = item.image_url;
          }
        });
        
        setImages(newImages);
        cacheImages(newImages);
        preloadImages(newImages);
      } else {
        localStorage.removeItem(SECTION_IMAGES_CACHE_KEY);
      }
    } catch (error) {
      console.error('Error cargando imágenes de sección:', error);
      const cachedImages = getCachedImages();
      if (cachedImages) {
        setImages(cachedImages);
        preloadImages(cachedImages);
      }
    }
  };

  const handleSelect = (gender: Gender) => {
    setHoveredGender(gender);
    setTimeout(() => {
      onSelect(gender);
    }, 200);
  };

  const handleImageLoad = (gender: Gender | 'main_banner') => {
    setImagesLoaded(prev => ({ ...prev, [gender]: true }));
  };

  const handleScrollDown = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === 0) return;
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      setShowColdWeather(diff > 0);
      setTouchStartX(0);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(0);
  };

  return (
    <div
      className="flex flex-col relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isLoadingImages && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="animate-pulse text-xl text-gray-400">Cargando...</div>
        </div>
      )}

      {/* Sección de Portada Principal */}
      <section className="h-[55vh] md:h-screen relative flex flex-col items-center justify-end text-black bg-white pb-2">
        {mainBannerUrl && (
          <img
            src={mainBannerUrl}
            alt="Portada Principal"
            className="absolute inset-0 w-full h-full object-contain md:object-cover"
            style={{ objectPosition: 'center center' }}
            onLoad={() => handleImageLoad('main_banner')}
          />
        )}
        
        <div className="relative z-10 w-full">
          <div className="flex justify-center">
            <button
              onClick={handleScrollDown}
              className="bg-white text-black px-6 py-3 rounded-md shadow-lg"
            >
              <span className="text-lg font-medium tracking-wider uppercase">Explora las novedades</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contenido principal que se revela al hacer scroll */}
      <section ref={categoriesRef} className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Personajes Favoritos */}
            <div
              className="cursor-pointer group"
              onClick={() => handleSelect('women')}
            >
              <div className="overflow-hidden aspect-square bg-gray-100">
                {womenImageUrl && (
                  <img
                    src={womenImageUrl}
                    alt="Sección Personajes Favoritos"
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    onLoad={() => handleImageLoad('women')}
                  />
                )}
              </div>
              <h2 className="text-lg md:text-xl text-center mt-2 md:mt-3 font-light tracking-wider">PERSONAJES FAVORITOS</h2>
            </div>

            {/* Poleras de Anime */}
            <div
              className="cursor-pointer group"
              onClick={() => handleSelect('men')}
            >
              <div className="overflow-hidden aspect-square bg-gray-100">
                {menImageUrl && (
                  <img
                    src={menImageUrl}
                    alt="Sección Poleras de Anime"
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    onLoad={() => handleImageLoad('men')}
                  />
                )}
              </div>
              <h2 className="text-lg md:text-xl text-center mt-2 md:mt-3 font-light tracking-wider">POLERAS DE ANIME</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Cold Weather - Solo visible en desktop con hover */}
      {showColdWeather && (
        <section className="hidden md:block absolute inset-0 z-30 bg-black bg-opacity-50">
          <div className="h-full flex items-center justify-center">
            <div
              className="cursor-pointer group max-w-md mx-4"
              onClick={() => handleSelect('cold_weather')}
            >
              <div className="overflow-hidden aspect-square bg-gray-100 rounded-lg shadow-2xl">
                {coldWeatherImageUrl && (
                  <img
                    src={coldWeatherImageUrl}
                    alt="Sección Ropa de Abrigo"
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    onLoad={() => handleImageLoad('cold_weather')}
                  />
                )}
              </div>
              <h2 className="text-xl text-center mt-4 font-light tracking-wider text-white">ROPA DE ABRIGO</h2>
            </div>
          </div>
        </section>
      )}

      {/* Navegación lateral para Cold Weather en desktop */}
      <div className="hidden md:flex fixed left-4 top-1/2 transform -translate-y-1/2 z-40 flex-col space-y-4">
        <button
          onMouseEnter={() => setShowColdWeather(true)}
          onMouseLeave={() => setShowColdWeather(false)}
          className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden md:flex fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex-col space-y-4">
        <button
          onMouseEnter={() => setShowColdWeather(true)}
          onMouseLeave={() => setShowColdWeather(false)}
          className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};