import React, { useEffect, useState } from 'react';
import { GenderSelection } from './components/GenderSelection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Menu, Heart, ArrowLeft, Info, X as IconX } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ClothingItem, Gender, Category } from './types';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ProductPage from './pages/ProductPage';

// Componente para la vista de favoritos
const FavoritesView = ({
  favorites,
  products,
  toggleFavorite,
  onGoBack,
  footerContent,
}) => {
  const navigate = useNavigate(); // Añadir useNavigate aquí
  const favoriteItems = products.filter(item => favorites.includes(item.id));
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-medium mb-2">No tienes favoritos</h2>
        <p className="text-gray-500 mb-4 text-center">
          Marca productos como favoritos para verlos aquí
        </p>
        <button
          onClick={onGoBack}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-y-scroll">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-auto flex items-center justify-start">
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Volver"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow text-center">
              <Link to="/" className="inline-flex justify-center items-center">
                <img src="/Esther.PNG" alt="Esther Logo" className="h-24 mx-auto" />
              </Link>
            </div>
            <div className="w-auto flex items-center justify-end relative">
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
                    <div 
                      className="prose prose-sm max-h-60 overflow-y-auto text-left text-gray-700 whitespace-pre-wrap font-numbers"
                      dangerouslySetInnerHTML={{ 
                        __html: footerContent ? footerContent.replace(
                          /https:\/\/[^\s]+/g, 
                          (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${url}</a>`
                        ) : '<p>No hay información disponible.</p>' 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-medium mb-6 text-center">Mis Favoritos</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteItems.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              isFavorite={true}
              onToggleFavorite={(e, productId) => {
                e.stopPropagation();
                toggleFavorite(productId);
              }}
              onClick={() => navigate(`/product/${item.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const MainPage = ({
  products,
  favorites,
  toggleFavorite,
  setSelectedItem,
  selectedItem,
  isAdmin,
  footerContent,
  selectedGender,
  setSelectedGender,
  viewingFavorites,
  setViewingFavorites,
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // Importante: añadir useNavigate
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('view') === 'favorites') {
      if (!selectedGender) {
        setSelectedGender('women');
      }
      setViewingFavorites(true);
    }
  }, [location.search, selectedGender, setSelectedGender, setViewingFavorites]);

  const filteredCategories = products
    .filter(p => p.gender === selectedGender)
    .reduce((acc, current) => {
      if (!acc.find(item => item.id === current.category_id)) {
        const category = products.find(p => p.id === current.category_id);
        // Aquí deberías tener una lista de categorías separada para obtener el nombre
        // Esto es un workaround
        acc.push({ id: current.category_id, name: `Categoría ${current.category_id}` });
      }
      return acc;
    }, [] as { id: string; name: string }[]);

  const filteredItems = products.filter(item => {
    const genderMatch = item.gender === selectedGender;
    const categoryMatch = !selectedCategory || item.category_id === selectedCategory;
    return genderMatch && categoryMatch;
  });

  if (selectedGender && viewingFavorites) {
    return (
      <FavoritesView
        favorites={favorites}
        products={products}
        toggleFavorite={toggleFavorite}
        onGoBack={() => {
          setViewingFavorites(false);
          // Limpiamos el parámetro de la URL para que no se reactive
          navigate('/', { replace: true });
        }}
        footerContent={footerContent}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {selectedGender ? (
        <div className="min-h-screen bg-white">
          <header className="sticky top-0 z-40 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Contenedor izquierdo con ancho fijo y posicionamiento relativo */}
                <div className="relative w-16 flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    aria-label="Abrir menú"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  {/* Menú desplegable */}
                  <aside className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <nav className="p-1">
                      <button
                        onClick={() => {
                          setSelectedGender(selectedGender === 'women' ? 'men' : 'women');
                          setIsMenuOpen(false); // Cierra el menú al cambiar de sección
                          setViewingFavorites(false); // <-- Añade esta línea
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Cambiar Sección
                      </button>
                    </nav>
                  </aside>
                </div>

                {/* Contenedor central que centra el logo */}
                <div className="flex-grow text-center">
                  <button onClick={() => setSelectedGender(null)}>
                    <img src="/Esther.PNG" alt="Esther Logo" className="h-24 mx-auto" />
                  </button>
                </div>

                {/* Contenedor derecho con ancho fijo para equilibrar */}
                <div className="w-auto flex items-center justify-end space-x-2">
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
                        <div 
                          className="prose prose-sm max-h-60 overflow-y-auto text-left text-gray-700 whitespace-pre-wrap font-numbers"
                          dangerouslySetInnerHTML={{ 
                            __html: footerContent ? footerContent.replace(
                              /https:\/\/[^\s]+/g, 
                              (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${url}</a>`
                            ) : '<p>No hay información disponible.</p>' 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setViewingFavorites(true)}
                    className="relative p-2 hover:bg-gray-100 rounded-md"
                    aria-label="Ver favoritos"
                  >
                    <Heart className="w-6 h-6" />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-numbers">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-4">
            <div className="flex flex-col md:flex-row gap-8">
              <main className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {filteredItems.map(item => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={(e, productId) => {
                        e.stopPropagation();
                        toggleFavorite(productId);
                      }}
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                  ))}
                </div>
              </main>
            </div>
          </div>
          {selectedItem && (
            <ProductModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              isFavorite={favorites.includes(selectedItem.id)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      ) : (
        <>
          {/* Logo grande sobre la portada */}
          <div
            className={`fixed top-0 left-0 w-full flex justify-center items-center z-40 transition-all duration-500 pointer-events-none ${
              isScrolled ? 'opacity-0 scale-75 -translate-y-16' : 'opacity-100 scale-100 translate-y-0'
            } mt-8 md:mt-16`} // <-- Agrega margen superior
            style={{ height: '120px' }}
          >
            <img
              src="/Esther.PNG"
              alt="Esther Logo"
              className="h-28 md:h-48 transition-all duration-500"
              style={{ filter: 'drop-shadow(0 2px 16px rgba(0,0,0,0.12))' }}
            />
          </div>
          {/* Header animado que aparece al hacer scroll */}
          <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
              isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
            }`}
          >
            <div
              className={`flex items-center justify-center mx-auto transition-all duration-500 ${
                isScrolled ? 'h-16' : 'h-0'
              }`}
            >
              <img
                src="/Esther.PNG"
                alt="Esther Logo"
                className={`transition-all duration-500 ${
                  isScrolled ? 'h-24' : 'h-0'
                }`}
              />
            </div>
          </header>
          <GenderSelection onSelect={(gender) => setSelectedGender(gender)} />
        </>
      )}
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [footerContent, setFooterContent] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [viewingFavorites, setViewingFavorites] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const productResponse = await supabase.from('products').select('*');
      setProducts(productResponse.data as ClothingItem[]);

      // Cargar favoritos desde localStorage
      const storedFavorites = localStorage.getItem('favorites');
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);

      const { data: siteInfoData } = await supabase
        .from('site_info')
        .select('content')
        .eq('key', 'footer')
        .single();

      setFooterContent(siteInfoData?.content || null);
    };

    fetchData();
  }, []);

  const toggleFavorite = (productId: number) => {
    const isFavorite = favorites.includes(productId);
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <BrowserRouter>
      <div className="font-sans antialiased">
        <Routes>
          <Route path="/" element={
            <MainPage
              products={products}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              setSelectedItem={setSelectedItem}
              selectedItem={selectedItem}
              isAdmin={isAdmin}
              footerContent={footerContent}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              viewingFavorites={viewingFavorites}
              setViewingFavorites={setViewingFavorites}
            />
          } />
          <Route path="/product/:id" element={
            <ProductPage
              products={products}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              footerContent={footerContent}
            />
          } />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}