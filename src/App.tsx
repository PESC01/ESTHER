import React, { useEffect, useState } from 'react';
import { GenderSelection } from './components/GenderSelection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Menu, Heart, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ClothingItem, Gender, Category } from './types';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductPage from './pages/ProductPage';

// Componente para la vista de favoritos
const FavoritesView = ({
  favorites,
  products,
  toggleFavorite,
  setSelectedItem,
  selectedItem,
  onGoBack
}) => {
  const favoriteItems = products.filter(item => favorites.includes(item.id));

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
            <div className="w-10 flex items-center justify-start">
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
                <img src="/Esther.PNG" alt="Esther Logo" className="h-12 mx-auto" />
              </Link>
            </div>
            <div className="w-10 flex items-center justify-end">
              {/* Espaciador invisible para un centrado perfecto */}
              <div className="p-2" aria-hidden="true">
                <div className="w-6 h-6"></div>
              </div>
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
              onClick={setSelectedItem}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {selectedItem && (
          <ProductModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
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
}) => {
  const location = useLocation();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewingFavorites, setViewingFavorites] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.state?.showFavorites) {
      // Necesitamos un género seleccionado para que la vista de favoritos funcione
      // así que establecemos uno por defecto si no hay ninguno.
      if (!selectedGender) {
        setSelectedGender('women');
      }
      setViewingFavorites(true);
    }
  }, [location.state, selectedGender]);

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
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        onGoBack={() => {
          setViewingFavorites(false);
          // Opcional: volver a la selección de género si el usuario lo prefiere
          // setSelectedGender(null);
        }}
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
                    <img src="/Esther.PNG" alt="Esther Logo" className="h-12 mx-auto" />
                  </button>
                </div>

                {/* Contenedor derecho con ancho fijo para equilibrar */}
                <div className="w-16 flex items-center justify-end">
                  <button
                    onClick={() => setViewingFavorites(true)}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-4">
            <div className="flex flex-col md:flex-row gap-8">
              <main className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {filteredItems.map(item => (
                    <Link key={item.id} to={`/product/${item.id}`} className="block">
                      <ProductCard
                        item={item}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </Link>
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
          <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
            }`}
          >
            <div
              className={`flex items-center justify-center mx-auto transition-all duration-300 ${
                isScrolled ? 'h-16' : 'h-80'
              }`}
            >
              <img
                src="/Esther.PNG"
                alt="Esther Logo"
                className={`transition-all duration-300 ${
                  isScrolled ? 'h-12' : 'h-32'
                }`}
              />
            </div>
          </header>
          <GenderSelection onSelect={setSelectedGender} />
        </>
      )}
    </div>
  );
};


function App() {
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para almacenar los IDs de productos favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    checkUser();
    loadData();
  }, []);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const loadData = async () => {
    try {
      const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').order('name')
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar favoritos
  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    // Detener la propagación para que no se abra el modal o se active el Link
    e.preventDefault();
    e.stopPropagation();

    setFavorites(prevFavorites => {
      if (prevFavorites.includes(productId)) {
        return prevFavorites.filter(id => id !== productId);
      } else {
        return [...prevFavorites, productId];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MainPage
            products={products}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setSelectedItem={setSelectedItem}
            selectedItem={selectedItem}
            isAdmin={isAdmin}
          />
        } />
        <Route path="/admin" element={isAdmin ? <AdminPanel /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
        <Route
          path="/product/:id"
          element={
            <ProductPage
              products={products}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;