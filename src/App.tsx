import React, { useEffect, useState } from 'react';
import { GenderSelection } from './components/GenderSelection';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Menu } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ClothingItem, Gender, Category } from './types';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadData();
  }, []);

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
                      
                    </div>
                  </div>
                </header>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <aside className={`md:w-64 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
                      <nav className="space-y-1">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            !selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-100'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setSelectedGender(null)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            !selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-100'
                          }`}
                        >
                          Cambiar Sección
                        </button>
                        {filteredCategories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-md ${
                              selectedCategory === category.id ? 'bg-black text-white' : 'hover:bg-gray-100'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </nav>
                    </aside>
                    <main className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            onClick={setSelectedItem}
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