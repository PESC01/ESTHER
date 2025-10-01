import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClothingItem, Category, Gender } from '../types';
import { Plus, Edit, Trash2, Save, X, LogOut } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { SectionImageUploader } from './SectionImageUploader';
import { fileManager } from '../lib/fileManager';
import { useImageUrl } from '../lib/imageUtils'; // Agregar este import
import { ColorManager } from './ColorManager';
import { SizeManager } from './SizeManager';

// Agregar el tipo SectionImage
interface SectionImage {
  id: string;
  gender: Gender;
  image_url: string;
}

// Crear un nuevo componente para renderizar cada fila de la tabla de productos
interface ProductRowProps {
  product: ClothingItem;
  categories: Category[];
  setEditingProduct: (product: ClothingItem) => void;
  deleteProduct: (id: string) => void; // <-- ajustar a string (ids son string en types)
}

const ProductRow: React.FC<ProductRowProps> = ({ product, categories, setEditingProduct, deleteProduct }) => {
  // Asegúrate de que product.image_urls sea siempre un array
  const imageUrls = product.image_urls || [];

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {imageUrls[0] ? (
            <img src={imageUrls[0]} alt={product.name} className="h-12 w-12 object-cover rounded" />
          ) : (
            <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded text-sm text-gray-500">
              Sin imagen
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap font-numbers">${product.price.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {categories.find(c => c.id === product.category_id)?.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap capitalize">{product.gender}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={() => setEditingProduct(product)}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded"
          >
            Editar
          </button>
          <button
            onClick={() => deleteProduct(product.id)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
};

// Simplificar el componente SectionImageComponent - solo uploader, sin URL manual
interface SectionImageProps {
  gender: Gender | 'main_banner';
  image: SectionImage | undefined;
  updateSectionImage: (gender: Gender | 'main_banner', imageUrl: string) => void;
}

const SectionImageComponent: React.FC<SectionImageProps> = ({ gender, image, updateSectionImage }) => {
  const getGenderDisplay = (gender: Gender | 'main_banner') => {
    switch (gender) {
      case 'women': return 'Personajes Favoritos';
      case 'men': return 'Poleras de Anime';
      case 'main_banner': return 'Portada Principal';
      default: return gender;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <SectionImageUploader
        label={`Imagen para ${getGenderDisplay(gender)}`}
        description="Esta imagen aparecerá en la página principal"
        currentImage={image?.image_url}
        onImageUpload={(imagePath) => updateSectionImage(gender, imagePath)}
      />
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ClothingItem[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [siteInfos, setSiteInfos] = useState<{ id: string; key: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'sections' | 'info'>('categories');
  const [newCategory, setNewCategory] = useState({ name: '', gender: 'women' as Gender });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<ClothingItem> | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<ClothingItem>>({
    name: '',
    price: 0,
    description: '',
    image_urls: [],
    category_id: '',
    gender: 'women',
    colors: [],
    sizes: []
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
  const [editingInfo, setEditingInfo] = useState<{ key: string; content: string } | null>(null);
  const [newInfoContent, setNewInfoContent] = useState<string>('');

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
        { data: sectionImagesData },
        { data: siteInfosData }
      ] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('section_images').select('*'),
        supabase.from('site_info').select('*')
      ]);

      // Asegúrate de que image_urls sea un array en todos los productos
      const productsWithImageUrls = productsData?.map(product => ({
        ...product,
        image_urls: product.image_urls || [], // Ensure image_urls is always an array
      })) || [];

      setCategories(categoriesData || []);
      setProducts(productsWithImageUrls);
      setSectionImages(sectionImagesData || []);
      setSiteInfos(siteInfosData || []);

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
    
    // Validación mejorada
    if (!newProduct.name?.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }
    
    if (!newProduct.category_id || newProduct.category_id.trim() === '') {
      alert('Debes seleccionar una categoría');
      return;
    }
    
    if (newImageUrls.length === 0) {
      alert('Debes subir al menos una imagen del producto');
      return;
    }

    try {
      const productToCreate = {
        name: newProduct.name.trim(),
        price: Number(newProduct.price) || 0,
        description: newProduct.description?.trim() || '',
        image_urls: newImageUrls,
        category_id: newProduct.category_id,
        gender: newProduct.gender || 'women',
        colors: newProduct.colors || [],
        sizes: newProduct.sizes || []
      };



      const { error } = await supabase
        .from('products')
        .insert([productToCreate]);

      if (error) throw error;
      
      alert('Producto creado exitosamente');
      
      // Reset form
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        image_urls: [],
        category_id: '',
        gender: 'women',
        colors: [],
        sizes: []
      });
      setNewImageUrls([]);
      
      loadData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error creando el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Solo eliminar el producto de la base de datos
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Producto eliminado exitosamente (imágenes conservadas en Cloudinary)');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error eliminando el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const updateSectionImage = async (gender: Gender | 'main_banner', imageUrl: string) => {
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

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.id) return;

    try {
      const productToUpdate = {
        ...editingProduct,
        image_urls: editingImageUrls,
        colors: editingProduct.colors || [],
        sizes: editingProduct.sizes || []
      };

      const { error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', editingProduct.id);

      if (error) throw error;
      alert('Producto actualizado exitosamente');
      setEditingProduct(null);
      setEditingImageUrls([]);
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error actualizando el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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

  // ----- CRUD para site_info -----
  const addSiteInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInfoContent.trim()) return alert('El contenido no puede estar vacío.');
    try {
      const { error } = await supabase.from('site_info').insert([{ key: 'footer', content: newInfoContent.trim() }]);
      if (error) throw error;
      setNewInfoContent('');
      loadData();
    } catch (err) {
      console.error('Error creando site_info:', err);
      alert('Error creando la información');
    }
  };

  const updateSiteInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInfo?.key) return;
    try {
      const { error } = await supabase.from('site_info').update({ key: editingInfo.key, content: editingInfo.content }).eq('key', editingInfo.key);
      if (error) throw error;
      setEditingInfo(null);
      loadData();
    } catch (err) {
      console.error('Error actualizando site_info:', err);
      alert('Error actualizando la información');
    }
  };

  const deleteSiteInfo = async (key: string) => {
    if (!confirm('¿Eliminar esta entrada de información?')) return;
    try {
      const { error } = await supabase.from('site_info').delete().eq('key', key);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error eliminando site_info:', err);
      alert('Error eliminando la información');
    }
  };
  // ----- fin CRUD site_info -----

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
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-black' : ''}`}
          >
            Información
          </button>
        </div>

        {activeTab === 'categories' && (
          <section className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-xl font-medium mb-4">Categorias</h2>
            <form onSubmit={addCategory} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 mb-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nuevo Categoria"
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              />
              <select
                value={newCategory.gender}
                onChange={(e) => setNewCategory({ ...newCategory, gender: e.target.value as Gender })}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="women">Personajes Favoritos</option>
                <option value="men">Poleras de Anime</option>
              </select>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </form>
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="block sm:inline">{category.name}</span>
               
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800 self-end sm:self-auto"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-numbers"
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

              {/* Reemplazar la sección de URLs de imágenes por el nuevo componente */}
              {!editingProduct && (
                <ImageUploader
                  label="Imágenes del producto"
                  onImageUpload={(imagePath) => {
                    setNewImageUrls([...newImageUrls, imagePath]);
                  }}
                  onImageRemove={(imagePath) => {
                    setNewImageUrls(newImageUrls.filter(url => url !== imagePath));
                  }}
                  currentImages={newImageUrls}
                  maxImages={5}
                />
              )}

              {editingProduct && (
                <ImageUploader
                  label="Imágenes del producto"
                  onImageUpload={(imagePath) => {
                    setEditingImageUrls([...editingImageUrls, imagePath]);
                  }}
                  onImageRemove={(imagePath) => {
                    setEditingImageUrls(editingImageUrls.filter(url => url !== imagePath));
                  }}
                  currentImages={editingImageUrls}
                  maxImages={5}
                />
              )}

              {/* Agregar después del ImageUploader y antes de los selects */}
              
              <ColorManager
                colors={editingProduct?.colors || newProduct.colors || []}
                onColorsChange={(colors) => editingProduct
                  ? setEditingProduct({ ...editingProduct, colors })
                  : setNewProduct({ ...newProduct, colors })
                }
              />

              <SizeManager
                sizes={editingProduct?.sizes || newProduct.sizes || []}
                onSizesChange={(sizes) => editingProduct
                  ? setEditingProduct({ ...editingProduct, sizes })
                  : setNewProduct({ ...newProduct, sizes })
                }
              />

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
                    <option key={category.id} value={category.id}>{category.name}</option>
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
                  <option value="women">Personajes Favoritos</option>
                  <option value="men">Poleras de Anime</option>
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
                      key={product.id ?? `product-${index}`}
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
            <h2 className="text-xl font-medium mb-4">Imágenes de Sección</h2>
            <p className="text-gray-600 mb-6">
              Sube una imagen para cada sección. Las imágenes se guardarán en la carpeta products.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Añadir 'main_banner' a la lista de imágenes a gestionar */}
              {(['main_banner', 'women', 'men'] as (Gender | 'main_banner')[]).map((gender) => (
                <SectionImageComponent
                  key={gender}
                  gender={gender}
                  image={sectionImages.find(img => img.gender === gender)}
                  updateSectionImage={updateSectionImage}
                />
              ))}
            </div>
            
           
          </section>
        )}

        {activeTab === 'info' && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-4">Información del Sitio</h2>
            <p className="text-gray-600 mb-4">Aquí puedes gestionar la información de contacto y otros detalles que se mostrarán en la tienda.</p>

            {siteInfos.find(info => info.key === 'footer') ? (
              // Si la información ya existe, mostrarla con opciones de edición/eliminación
              siteInfos.filter(info => info.key === 'footer').map(info => (
                <div key={info.key}>
                  {editingInfo && editingInfo.key === info.key ? (
                    // Formulario de edición
                    <form onSubmit={updateSiteInfo} className="grid gap-2">
                      <h3 className="text-lg mb-2">Editar Información</h3>
                      <textarea
                        value={editingInfo.content}
                        onChange={(e) => setEditingInfo({ ...editingInfo, content: e.target.value })}
                        className="px-3 py-2 border rounded font-numbers"
                        rows={5}
                      />
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditingInfo(null)} className="px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-black text-white rounded">Guardar</button>
                      </div>
                    </form>
                  ) : (
                    // Vista de la información
                    <div className="border rounded p-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="prose max-w-none font-numbers" dangerouslySetInnerHTML={{ __html: info.content || '<i>Vacío</i>' }} />
                        <div className="flex flex-col gap-2">
                          <button onClick={() => setEditingInfo(info)} className="px-3 py-1 bg-yellow-100 rounded">Editar</button>
                          <button onClick={() => deleteSiteInfo(info.key)} className="px-3 py-1 bg-red-100 rounded">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Si no existe información, mostrar el formulario de creación
              <form onSubmit={addSiteInfo} className="mb-4 grid gap-2">
                <h3 className="text-lg mb-2">Crear Información del Sitio</h3>
                <textarea
                  placeholder="Contenido (HTML permitido)"
                  value={newInfoContent}
                  onChange={(e) => setNewInfoContent(e.target.value)}
                  className="px-3 py-2 border rounded font-numbers"
                  rows={5}
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded">Crear</button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
};