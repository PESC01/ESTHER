import React, { useEffect, useState } from 'react';
import { GenderSelection } from './components/GenderSelection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Menu, Heart } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ClothingItem, Gender, Category } from './types';
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onGoBack}
          className="px-4 py-2 hover:bg-gray-100 rounded-md"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-medium">Mis Favoritos</h1>
        <div className="w-24"></div> {/* Espacio para equilibrar el header */}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
  );
};

function App() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para almacenar los IDs de productos favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  // Estado para ver si estamos en la vista de favoritos
  const [viewingFavorites, setViewingFavorites] = useState(false);

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
    // Detener la propagación para que no se abra el modal
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

  const filteredCategories = categories.filter(category => category.gender === selectedGender);
  const filteredItems = selectedCategory
    ? products.filter(item => item.category_id === selectedCategory && item.gender === selectedGender)
    : products.filter(item => item.gender === selectedGender);

  // Renderizado condicional para la vista de favoritos
  if (selectedGender && viewingFavorites) {
    return (
      <FavoritesView
        favorites={favorites}
        products={products}
        toggleFavorite={toggleFavorite}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        onGoBack={() => setViewingFavorites(false)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            {selectedGender ? (
              <div className="min-h-screen bg-white">
                <header className="sticky top-0 z-40 bg-white border-b">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:flex-nowrap flex-wrap">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-md md:hidden"
                      >
                        <Menu className="w-6 h-6" />
                      </button>
                      <div className="flex-grow text-center">
                        <button onClick={() => setSelectedGender(null)}>
                          <img src="/Esther.PNG" alt="Esther Logo" className="h-12 mx-auto" />
                        </button>
                      </div>

                      {/* Botón de favoritos con contador */}
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
                </header>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <aside className={`md:w-64 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
                      <nav className="space-y-1">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`w-full text-left px-3 py-2 rounded-md ${!selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-100'
                            }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setSelectedGender(null)}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100`}
                        >
                          Cambiar Sección
                        </button>
                        {filteredCategories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-md ${selectedCategory === category.id ? 'bg-black text-white' : 'hover:bg-gray-100'
                              }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </nav>
                    </aside>
                    <main className="flex-1">
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {filteredItems.map(item => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            onClick={setSelectedItem}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={toggleFavorite}
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
                  />
                )}
              </div>
            ) : (
              <>
                <header className="fixed top-0 left-0 right-0 z-50 bg-white p-6">
                  <img src="/Esther.PNG" alt="Esther Logo" className="h-12 mx-auto" />
                </header>
                <GenderSelection onSelect={setSelectedGender} />
              </>
            )}
          </div>
        } />
        <Route path="/admin" element={isAdmin ? <AdminPanel /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;