import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClothingItem, Color, Size } from '../types';
import { supabase } from '../lib/supabase';
import { useImageUrl } from '../lib/imageUtils';
import { Phone, Heart, X as IconX, ArrowLeft } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';

interface Props {
  products: ClothingItem[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, id: string) => void;
  footerContent: string;
}

// Función para prevenir descarga de imágenes
const preventImageActions = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

const Thumbnail: React.FC<{ url: string; onClick: () => void; active: boolean; alt: string }> = ({ url, onClick, active, alt }) => {
  const thumbUrl = useImageUrl(url || '');
  return (
    <button
      onClick={onClick}
      aria-label={alt}
      aria-pressed={active}
      className={`flex-shrink-0 rounded overflow-hidden focus:outline-none transition-transform duration-150 ease-out transform ${
        active ? 'scale-105 ring-2 ring-black shadow-md' : 'opacity-80 hover:scale-105'
      }`}
      style={{ width: 56, height: 56 }}
      title={alt}
    >
      <img 
        src={thumbUrl} 
        alt={alt} 
        className="w-full h-full object-cover pointer-events-none select-none" 
        draggable={false}
        onContextMenu={preventImageActions}
        onDragStart={preventImageActions}
      />
    </button>
  );
};

export const ProductPage: React.FC<Props> = ({ products, favorites, toggleFavorite, footerContent }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Estados similares al modal
  const [mainIndex, setMainIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  
  // Estados para el zoom
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Nueva lógica para mostrar TODAS las imágenes en las miniaturas
  const allThumbnails = React.useMemo(() => {
    if (!item) return [];
    const generalImages = item.image_urls || [];
    const colorImages = item.colors?.flatMap(c => c.image_urls || []) || [];
    // Usamos un Set para evitar URLs duplicadas si una imagen está en general y en un color
    return [...new Set([...generalImages, ...colorImages])];
  }, [item]);

  // Calcular imágenes a mostrar y thumbnails de forma consistente:
  // - Si hay color seleccionado => usar sus imágenes
  // - Si NO hay color seleccionado y existen image_urls generales => usarlas
  // - Si NO hay imágenes generales pero hay colores => aplanar todas las image_urls de los colores
  // Esto asegura que ALWAYS tengamos la lista de miniaturas adecuada.
  const displayImages = React.useMemo(() => {
    if (!item) return [];

    // 1) Color seleccionado con imágenes
    if (selectedColor && selectedColor.image_urls && selectedColor.image_urls.length > 0) {
      return selectedColor.image_urls;
    }

    // 2) Imágenes generales del producto
    if (item.image_urls && item.image_urls.length > 0) {
      return item.image_urls;
    }

    // 3) Aplanar todas las imágenes de los colores (si existen)
    if (item.colors && item.colors.length > 0) {
      const flattened = item.colors.flatMap(c => c.image_urls || []);
      if (flattened.length > 0) return flattened;
      // fallback: devolver las image_urls del primer color (aunque vacías)
      return item.colors[0].image_urls || [];
    }

    // fallback general
    return item.image_urls || [];
  }, [item, selectedColor]);

  // Llamada al hook de imagen principal (siempre llamada, incluso si displayImages vacío)
  const mainImageUrl = useImageUrl(displayImages[mainIndex] || '');

  // Resetear índice principal cuando cambien las imágenes mostradas
  useEffect(() => {
    setMainIndex(0);
  }, [displayImages]);

  // Inicializar selectedColor si no hay image_urls generales (igual que en el modal)
  useEffect(() => {
    if (!item) return;
    if ((!item.image_urls || item.image_urls.length === 0) && item.colors && item.colors.length > 0) {
      const firstColorWithImages = item.colors.find(color => color.image_urls && color.image_urls.length > 0);
      if (firstColorWithImages) {
        setSelectedColor(firstColorWithImages);
      } else {
        setSelectedColor(item.colors[0]);
      }
    } else {
      setSelectedColor(null);
    }
  }, [item]);

  // Cargar producto usando products (cache) o Supabase (fallback)
  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setItem(found);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error('Error fetching product:', error);
          setItem(null);
        } else {
          setItem(data as ClothingItem);
        }
      } catch (err) {
        console.error(err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, products]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4">Producto no encontrado.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black text-white rounded">Volver</button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(item.id);

  const getOrderMessage = () => {
    let message = `Hola! Quisiera realizar un pedido de ${item.name} con un precio de ${item.price.toFixed(2)} Bs.`;
    if (selectedColor) message += ` Color: ${selectedColor.name}.`;
    if (selectedSize) message += ` Talla: ${selectedSize.name}.`;
    message += ' Gracias!';
    return encodeURIComponent(message);
  };
  const whatsappLink = `https://wa.me/74534873?text=${getOrderMessage()}`;

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Botón de volver a la izquierda */}
            <div className="w-auto flex items-center justify-start">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Volver"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Contenedor central que centra el logo */}
            <div className="flex-grow text-center">
              <button onClick={() => navigate('/')} aria-label="Inicio">
                <img src="/Esther.PNG" alt="Esther Logo" className="h-12 mx-auto" />
              </button>
            </div>

            {/* Contenedor derecho con ancho fijo para equilibrar el centro */}
            <div className="w-auto flex items-center justify-end space-x-2 relative">
               <button
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="relative px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-md"
                aria-label="Ver información"
              >
                Información
              </button>
              {isInfoOpen && (
                <div className="absolute top-full right-0 mt-2 w-screen max-w-md md:max-w-lg rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 relative">
                    <button
                      onClick={() => setIsInfoOpen(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      aria-label="Cerrar"
                    >
                      <IconX className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-medium mb-2 text-left">Información</h3>
                    <div className="prose prose-sm max-h-60 overflow-y-auto text-left text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: footerContent || '<p>No hay información disponible.</p>' }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/?view=favorites')}
                className="relative p-2 hover:bg-gray-100 rounded-md"
                aria-label="Ver favoritos"
              >
                <Heart className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Columna de imágenes (ocupa toda la fila en móvil) */}
            <div className="flex flex-col gap-2 sm:gap-4 md:col-span-1">
              {displayImages.length > 0 ? (
                <>
                  <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden border rounded-lg">
                    <img 
                      id="product-main-image" 
                      src={mainImageUrl} 
                      alt={item.name} 
                      className={`absolute inset-0 w-full h-full object-contain cursor-zoom-in transition-transform duration-200 pointer-events-none select-none ${isZoomed ? 'cursor-zoom-out' : ''}`}
                      style={{ transform: `scale(${zoomLevel})` }}
                      tabIndex={-1}
                      draggable={false}
                      onContextMenu={preventImageActions}
                      onDragStart={preventImageActions}
                      onClick={() => {
                        if (isZoomed) {
                          setIsZoomed(false);
                          setZoomLevel(1);
                        } else {
                          setIsZoomed(true);
                          setZoomLevel(2);
                        }
                      }}
                    />
                    
                    {/* Controles de zoom */}
                    <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomLevel(prev => Math.min(prev + 0.5, 3));
                          setIsZoomed(true);
                        }}
                        className="bg-black/70 text-white p-1 rounded text-xs hover:bg-black/90"
                        aria-label="Acercar"
                      >
                        +
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newZoom = Math.max(zoomLevel - 0.5, 1);
                          setZoomLevel(newZoom);
                          if (newZoom === 1) setIsZoomed(false);
                        }}
                        className="bg-black/70 text-white p-1 rounded text-xs hover:bg-black/90"
                        aria-label="Alejar"
                      >
                        -
                      </button>
                      {isZoomed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomLevel(1);
                            setIsZoomed(false);
                          }}
                          className="bg-black/70 text-white p-1 rounded text-xs hover:bg-black/90"
                          aria-label="Reset zoom"
                        >
                          1:1
                        </button>
                      )}
                    </div>
                  </div>

                  {allThumbnails.length > 1 && (
                    <div className="mt-3">
                      <div
                        className="flex gap-3 items-center overflow-x-auto pb-2"
                        role="list"
                        aria-label="Miniaturas del producto"
                      >
                        {allThumbnails.map((url, index) => (
                          <Thumbnail
                            key={`thumb-${index}`}
                            url={url}
                            alt={`${item.name} miniatura ${index + 1}`}
                            active={url === displayImages[mainIndex]}
                            onClick={() => {
                              // Lógica para actualizar la imagen principal al hacer clic en una miniatura
                              const colorOfClickedImage = item.colors?.find(c => c.image_urls?.includes(url));
                              
                              if (colorOfClickedImage) {
                                // Si la imagen pertenece a un color, selecciona ese color
                                setSelectedColor(colorOfClickedImage);
                                const newMainIndex = colorOfClickedImage.image_urls?.indexOf(url) ?? 0;
                                setMainIndex(newMainIndex);
                              } else {
                                // Si es una imagen general, quita la selección de color
                                setSelectedColor(null);
                                const newMainIndex = item.image_urls?.indexOf(url) ?? 0;
                                setMainIndex(newMainIndex);
                              }

                              // desplazar ligeramente el contenedor para que la miniatura seleccionada quede visible
                              try {
                                const btn = document.querySelector(`button[title="${item.name} miniatura ${index + 1}"]`);
                                if (btn && (btn as HTMLElement).scrollIntoView) {
                                  (btn as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center' });
                                }
                              } catch {}
                              // Opcional: mover foco al main image para accesibilidad
                              const mainImg = document.getElementById('product-main-image');
                              if (mainImg) (mainImg as HTMLElement).focus();
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen disponible</span>
                </div>
              )}
            </div>

            {/* Selector de colores (visible solo en móvil, debajo de las imágenes) */}
            {item.colors && item.colors.length > 0 && (
              <div className="md:hidden mt-6 mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color: {selectedColor?.name || 'Selecciona un color'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {item.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500'}`}
                      style={{ backgroundColor: color.hex_code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Columna de información (ocupa toda la fila en móvil) */}
            <div className="md:col-span-1 flex flex-col justify-between">
              {/* Contenedor para que el botón de pedido quede abajo */}
              <div className="flex flex-col h-full">
                {/* Info principal del producto */}
                <div className="flex-grow mt-4 md:mt-0">
                  <h1 className="text-2xl font-medium mb-2">{item.name}</h1>
                  <p className="text-xl mb-4 font-numbers">{item.price.toFixed(2)} Bs</p>
                  <p className="text-gray-600 mb-4">{item.description}</p>

                  {/* Selector de colores (visible solo en desktop) */}
                  {item.colors && item.colors.length > 0 && (
                    <div className="mb-4 hidden md:block">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color: {selectedColor?.name || 'Selecciona un color'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {item.colors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.id === color.id ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500'}`}
                            style={{ backgroundColor: color.hex_code }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selector de tallas */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Talla: {selectedSize?.name || 'Selecciona una talla'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {item.sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${selectedSize?.id === size.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={(e) => toggleFavorite(e as unknown as React.MouseEvent, item.id)}
                      className={`px-3 py-2 rounded-md border ${isFavorite ? 'bg-pink-100 border-pink-300' : 'bg-white border-gray-200'}`}
                      aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'text-pink-500' : 'text-gray-700'}`} />
                    </button>

                    <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md">
                      <Phone className="w-4 h-4" />
                      Realizar Pedido
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;