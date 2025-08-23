import React, { useEffect, useState } from 'react';
import { Gender } from '../types';
import { supabase } from '../lib/supabase';
import { useImageUrl } from '../lib/imageUtils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface GenderSelectionProps {
  onSelect: (gender: Gender) => void;
}

// Clave para guardar las imágenes en localStorage
const SECTION_IMAGES_CACHE_KEY = 'section_images_cache';

export const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
  const [images, setImages] = useState<Record<Gender, string>>({
    women: '',
    men: '',
    cold_weather: ''
  });
  const [hoveredGender, setHoveredGender] = useState<Gender | null>(null);
  const [showColdWeather, setShowColdWeather] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // Estados para controlar si las imágenes están cargadas
  const [imagesLoaded, setImagesLoaded] = useState<Record<Gender, boolean>>({
    women: false,
    men: false,
    cold_weather: false
  });
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const womenImageUrl = useImageUrl(images.women);
  const menImageUrl = useImageUrl(images.men);
  const coldWeatherImageUrl = useImageUrl(images.cold_weather);

  useEffect(() => {
    // Siempre cargar desde la base de datos para asegurar datos actualizados
    loadSectionImages();
    

  }, []);

  // Función para obtener imágenes del caché
  const getCachedImages = (): Record<Gender, string> | null => {
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

  // Función para guardar imágenes en caché
  const cacheImages = (imageUrls: Record<Gender, string>) => {
    try {
      localStorage.setItem(SECTION_IMAGES_CACHE_KEY, JSON.stringify(imageUrls));
    } catch (error) {
      console.error('Error guardando imágenes en caché:', error);
    }
  }

  // Función para precargar imágenes
  const preloadImages = (imageUrls: Record<Gender, string>) => {
    setIsLoadingImages(true);

    const preloadPromises = Object.entries(imageUrls).map(([gender, url]) => {
      if (!url) {
        console.log(`No hay URL para ${gender}`);
        return Promise.resolve();
      }

      console.log(`Precargando imagen para ${gender}:`, url); // Debug

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Imagen cargada exitosamente para ${gender}`); // Debug
          setImagesLoaded(prev => ({ ...prev, [gender]: true }));
          resolve();
        };
        img.onerror = (error) => {
          console.error(`Error cargando imagen para ${gender}:`, url, error);
          console.log('Intentando una segunda vez con un timeout');
          
          // Intentar una segunda vez con un timeout
          setTimeout(() => {
            const img2 = new Image();
            img2.onload = () => {
              console.log(`Imagen cargada en segundo intento para ${gender}`);
              setImagesLoaded(prev => ({ ...prev, [gender]: true }));
              resolve();
            };
            img2.onerror = () => {
              console.error(`Fallo definitivo cargando imagen para ${gender}`);
              resolve(); // Resolvemos para no bloquear otras imágenes
            };
            img2.src = url;
          }, 1000);
        };
        img.src = url;
      });
    });

    Promise.all(preloadPromises).then(() => {
      console.log('Todas las imágenes procesadas');
      setIsLoadingImages(false);
    });
  };

  // Actualizar la función loadSectionImages para manejar mejor los errores
  const loadSectionImages = async () => {
    try {
      const { data, error } = await supabase
        .from('section_images')
        .select('*');

      if (error) {
        console.error('Error cargando imágenes de sección:', error);
        // Usar caché como fallback si hay error en la base de datos
        const cachedImages = getCachedImages();
        if (cachedImages) {
          setImages(cachedImages);
          preloadImages(cachedImages);
        }
        return;
      }

      console.log('🔍 Datos completos de section_images:', data);

      if (data && data.length > 0) {
        const newImages = {
          women: '',
          men: '',
          cold_weather: ''
        };
        
        console.log('🔍 Estado inicial de images:', newImages);
        
        data.forEach(item => {
          console.log(`🔍 Procesando item:`, item);
          console.log(`🔍 Gender: ${item.gender}, URL: ${item.image_url}`);
          
          if (item.image_url) {
            newImages[item.gender as Gender] = item.image_url;
            console.log(`✅ Asignado ${item.gender}: ${item.image_url}`);
          } else {
            console.log(`❌ No hay URL para ${item.gender}`);
          }
        });
        
        console.log('🔍 Estado final de newImages:', newImages);
        
        setImages(newImages);
        cacheImages(newImages);
        preloadImages(newImages);
      } else {
        console.log('No se encontraron imágenes de sección en la base de datos');
        // Limpiar caché si no hay datos
        localStorage.removeItem(SECTION_IMAGES_CACHE_KEY);
      }
    } catch (error) {
      console.error('Error cargando imágenes de sección:', error);
      // Usar caché como fallback
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

  const handleImageLoad = (gender: Gender) => {
    setImagesLoaded(prev => ({ ...prev, [gender]: true }));
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
      className="flex flex-col relative pt-24 sm:pt-28 h-[calc(100vh-6rem)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Solo mostrar indicador de carga si estamos cargando imágenes por primera vez */}
      {isLoadingImages && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="animate-pulse text-xl text-gray-400">Cargando...</div>
        </div>
      )}

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
            {womenImageUrl && (
              <img
                src={womenImageUrl}
                alt="Women's Collection"
                className={`w-full h-full object-cover md:object-contain transition-transform duration-200 ${hoveredGender === 'women' ? 'scale-105' : ''}`}
                onLoad={() => handleImageLoad('women')}
                style={{ opacity: imagesLoaded.women ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
              />
            )}
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
            {menImageUrl && (
              <img
                src={menImageUrl}
                alt="Men's Collection"
                className={`w-full h-full object-cover md:object-contain transition-transform duration-200 ${hoveredGender === 'men' ? 'scale-105' : ''}`}
                onLoad={() => handleImageLoad('men')}
                style={{ opacity: imagesLoaded.men ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
              />
            )}
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
            {coldWeatherImageUrl && (
              <img
                src={coldWeatherImageUrl}
                alt="Cold Weather Collection"
                className="w-full h-full object-cover md:object-contain transition-transform duration-200"
                onLoad={() => handleImageLoad('cold_weather')}
                style={{
                  opacity: imagesLoaded.cold_weather ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  transform: hoveredGender === 'cold_weather' ? 'scale(1.05)' : 'scale(1)'
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-2xl sm:text-4xl md:text-6xl text-white font-light tracking-wider">ROPA DE FRÍO</h2>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para alternar entre vistas */}
      <button
        onClick={toggleDisplay}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 sm:p-1 text-white hover:bg-opacity-70 transition-all duration-300 focus:outline-none"
        aria-label={showColdWeather ? "Mostrar categorías" : "Ver ropa de frío"}
      >
        {showColdWeather ? (
          <ChevronLeft size={16} className="sm:size-20" />
        ) : (
          <ChevronRight size={16} className="sm:size-20" />
        )}
      </button>
    </div>
  );
};