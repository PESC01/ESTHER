import React, { useState, useEffect } from 'react';
import { ProductImage } from './ProductImage';
import { supabase } from '../lib/supabase';
import { Category, ClothingItem, SectionImage, Gender } from '../types';
import { Plus, Trash2, LogOut, Edit, X, Save } from 'lucide-react';
import { useImageUrl } from '../lib/imageUtils';

// Crear un nuevo componente para renderizar cada fila de la tabla de productos
interface ProductRowProps {
  product: ClothingItem;
  categories: Category[];
  setEditingProduct: (product: ClothingItem) => void;
  deleteProduct: (id: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, categories, setEditingProduct, deleteProduct }) => {
  // Asegúrate de que product.image_urls sea siempre un array
  const imageUrls = product.image_urls || [];

  // Usar un hook por cada posible URL (con un máximo fijo)
  // Esto evita el error de "rendered fewer hooks than expected"
  const maxImages = 5; // Define un máximo razonable de imágenes

  // Crear un array de URLs resueltas
  const imageUrlsResolved: string[] = [];

  // Procesar cada URL hasta el máximo
  for (let i = 0; i < maxImages; i++) {
    // Usar el hook para cada posición potencial
    const url = i < imageUrls.length ? imageUrls[i] : '';
    const resolvedUrl = useImageUrl(url);

    // Solo agregar URLs válidas al array resultante
    if (i < imageUrls.length) {
      imageUrlsResolved.push(resolvedUrl);
    }
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        {imageUrlsResolved.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`${product.name} - ${index + 1}`}
            className="h-12 w-12 object-cover rounded mr-2"
          />
        ))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {categories.find(c => c.id === product.category_id)?.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap capitalize">{product.gender}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={() => setEditingProduct(product)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteProduct(product.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Nuevo componente para renderizar cada imagen de sección
interface SectionImageProps {
  gender: Gender;
  image: SectionImage | undefined;
  updateSectionImage: (gender: Gender, imageUrl: string) => void;
}

const SectionImageComponent: React.FC<SectionImageProps> = ({ gender, image, updateSectionImage }) => {
  const imageUrl = useImageUrl(image?.image_url || '');

  // Obtener el nombre legible del género
  const getGenderDisplay = (gender: Gender) => {
    switch (gender) {
      case 'women': return 'Mujer';
      case 'men': return 'Hombre';
      case 'cold_weather': return 'Ropa de Frío';
      default: return gender;
    }
  };

  return (
    <div key={gender} className="space-y-4">
      <h3 className="text-lg">{getGenderDisplay(gender)}</h3>
      {image && (
        <img
          src={imageUrl}
          alt={`${gender} section`}
          className="w-full h-48 object-cover rounded-md"
        />
      )}
      <input
        type="text"
        value={image?.image_url || ''}
        onChange={(e) => updateSectionImage(gender, e.target.value)}
        placeholder="URL de imagen"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
      />
    </div>
  );
};
export const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'sections'>('categories');
  const [newCategory, setNewCategory] = useState({ name: '', gender: 'women' as Gender });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<ClothingItem> | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<ClothingItem>>({
    name: '',
    price: 0,
    description: '',
    image_urls: [], // Cambiado a un array de strings
    category_id: '',
    gender: 'women'
  });
  const [sectionImagesUrls, setSectionImagesUrls] = useState<Record<Gender, string>>({
    women: '',
    men: '',
    cold_weather: '',
  });

  // Estado local para manejar las URLs de las imágenes del nuevo producto
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  // Estado local para manejar las URLs de las imágenes del producto en edición
  const [editingImageUrls, setEditingImageUrls] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Cuando se selecciona un producto para editar, actualiza las URLs de las imágenes en el estado local
    if (editingProduct) {
      setEditingImageUrls(editingProduct.image_urls || []);
    } else {
      setEditingImageUrls([]);
    }
  }, [editingProduct]);

  // filepath: src/components/AdminPanel.tsx
  const loadData = async () => {
    try {
      const [
        { data: categoriesData },
        { data: productsData },
        { data: sectionImagesData }
      ] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('section_images').select('*')
      ]);

      // Asegúrate de que image_urls sea un array en todos los productos
      const productsWithImageUrls = productsData?.map(product => ({
        ...product,
        image_urls: product.image_urls || [], // Ensure image_urls is always an array
      })) || [];

      setCategories(categoriesData || []);
      setProducts(productsWithImageUrls);
      setSectionImages(sectionImagesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory.name.trim(), gender: newCategory.gender }]);

      if (error) throw error;
      setNewCategory({ name: '', gender: 'women' });
      loadData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combina las URLs de las imágenes del estado local con el nuevo producto
      const productToInsert = {
        ...newProduct,
        image_urls: newImageUrls,
      };

      const { error } = await supabase
        .from('products')
        .insert([productToInsert]);

      if (error) throw error;
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        image_urls: [],
        category_id: '',
        gender: 'women'
      });
      setNewImageUrls([]); // Limpia las URLs de las imágenes después de agregar el producto
      loadData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.id) return;

    try {
      // Combina las URLs de las imágenes del estado local con el producto en edición
      const productToUpdate = {
        ...editingProduct,
        image_urls: editingImageUrls,
      };

      const { error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', editingProduct.id);

      if (error) throw error;
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const updateSectionImage = async (gender: Gender, imageUrl: string) => {
    try {
      const existingImage = sectionImages.find(img => img.gender === gender);

      if (existingImage) {
        const { error } = await supabase
          .from('section_images')
          .update({ image_url: imageUrl })
          .eq('id', existingImage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('section_images')
          .insert([{ gender, image_url: imageUrl }]);

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error updating section image:', error);
    }
  };

  // Función para agregar una nueva URL de imagen al estado local (nuevo producto)
  const handleAddImageUrl = () => {
    setNewImageUrls([...newImageUrls, '']);
  };

  // Función para actualizar una URL de imagen en el estado local (nuevo producto)
  const handleImageUrlChange = (index: number, url: string) => {
    const updatedImageUrls = [...newImageUrls];
    updatedImageUrls[index] = url;
    setNewImageUrls(updatedImageUrls);
  };

  // Función para eliminar una URL de imagen del estado local (nuevo producto)
  const handleRemoveImageUrl = (index: number) => {
    const updatedImageUrls = [...newImageUrls];
    updatedImageUrls.splice(index, 1);
    setNewImageUrls(updatedImageUrls);
  };

  // Funciones para manejar las URLs de las imágenes del producto en edición
  const handleAddEditingImageUrl = () => {
    setEditingImageUrls([...editingImageUrls, '']);
  };

  const handleEditingImageUrlChange = (index: number, url: string) => {
    const updatedImageUrls = [...editingImageUrls];
    updatedImageUrls[index] = url;
    setEditingImageUrls(updatedImageUrls);
  };

  const handleRemoveEditingImageUrl = (index: number) => {
    const updatedImageUrls = [...editingImageUrls];
    updatedImageUrls.splice(index, 1);
    setEditingImageUrls(updatedImageUrls);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light tracking-wider">ESTHER Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 ${activeTab === 'categories' ? 'border-b-2 border-black' : ''}`}
          >
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-black' : ''}`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 ${activeTab === 'sections' ? 'border-b-2 border-black' : ''}`}
          >
            Selección de imagenes
          </button>
        </div>

        {activeTab === 'categories' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-4">Categorias</h2>
            <form onSubmit={addCategory} className="flex gap-4 mb-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nuevo Categoria"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
              <select
                value={newCategory.gender}
                onChange={(e) => setNewCategory({ ...newCategory, gender: e.target.value as Gender })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="women">Mujer</option>
                <option value="men">Hombre</option>
                <option value="cold_weather">Ropa de Frío</option>
              </select>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </form>
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span>{category.name}</span>
                    <span className="ml-2 text-sm text-gray-500 capitalize">({category.gender})</span>
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-4">Productos</h2>

            <form onSubmit={editingProduct ? updateProduct : addProduct} className="mb-8 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={editingProduct?.name || newProduct.name}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={editingProduct?.price || newProduct.price || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    if (editingProduct) {
                      setEditingProduct({ ...editingProduct, price: value });
                    } else {
                      setNewProduct({ ...newProduct, price: value });
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              <textarea
                placeholder="Descripción"
                value={editingProduct?.description || newProduct.description}
                onChange={(e) => editingProduct
                  ? setEditingProduct({ ...editingProduct, description: e.target.value })
                  : setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />

              {/* Campos para agregar URLs de imágenes (nuevo producto) */}
              {!editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URLs de las imágenes
                  </label>
                  {newImageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={`URL de la imagen ${index + 1}`}
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar imagen
                  </button>
                </div>
              )}

              {/* Campos para agregar URLs de imágenes (producto en edición) */}
              {editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URLs de las imágenes
                  </label>
                  {editingImageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={`URL de la imagen ${index + 1}`}
                        value={url}
                        onChange={(e) => handleEditingImageUrlChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditingImageUrl(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEditingImageUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar imagen
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingProduct?.category_id || newProduct.category_id}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    : setNewProduct({ ...newProduct, category_id: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="">seleccione Categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name} ({category.gender})</option>
                  ))}
                </select>
                <select
                  value={editingProduct?.gender || newProduct.gender}
                  onChange={(e) => editingProduct
                    ? setEditingProduct({ ...editingProduct, gender: e.target.value as Gender })
                    : setNewProduct({ ...newProduct, gender: e.target.value as Gender })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                >
                  <option value="women">Mujer</option>
                  <option value="men">Hombre</option>
                  <option value="cold_weather">Ropa de Frío</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {editingProduct ? (
                    <>
                      <Save className="w-4 h-4" />
                      Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Agregar
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    // Usar el nuevo componente ProductRow aquí
                    <ProductRow
                      key={product.id}
                      product={product}
                      categories={categories}
                      setEditingProduct={setEditingProduct}
                      deleteProduct={deleteProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'sections' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-4">Section Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['women', 'men', 'cold_weather'] as Gender[]).map((gender) => (
                <SectionImageComponent
                  key={gender}
                  gender={gender === 'cold_weather' ? 'cold_weather' : gender}
                  image={sectionImages.find(img => img.gender === gender)}
                  updateSectionImage={updateSectionImage}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};