import { ClothingItem, Category } from './types';

export const categories: Category[] = [
  { id: 'dresses', name: 'Vestidos' },
  { id: 'shirts', name: 'Camisas' },
  { id: 'pants', name: 'Pantalones' },
  { id: 'shoes', name: 'Zapatos' },
  { id: 'accessories', name: 'Accesorios' },
];

export const clothingData: Record<string, ClothingItem[]> = {
  women: [
    {
      id: '1',
      name: 'Vestido Elegante Negro',
      price: 89.99,
      description: 'Vestido elegante negro perfecto para ocasiones especiales. Confeccionado con tela de alta calidad y diseño moderno.',
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956',
      category: 'dresses',
    },
    {
      id: '2',
      name: 'Blusa Seda Blanca',
      price: 45.99,
      description: 'Blusa de seda blanca con diseño clásico y elegante. Perfecta para cualquier ocasión.',
      image: 'https://images.unsplash.com/photo-1534126416832-a88fdf2911c2',
      category: 'shirts',
    },
  ],
  men: [
    {
      id: '3',
      name: 'Traje Negro Slim Fit',
      price: 299.99,
      description: 'Traje negro slim fit de alta calidad. Perfecto para ocasiones formales y eventos especiales.',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
      category: 'suits',
    },
    {
      id: '4',
      name: 'Camisa Blanca Formal',
      price: 59.99,
      description: 'Camisa blanca formal de algodón premium. Ideal para el trabajo o eventos formales.',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10',
      category: 'shirts',
    },
  ],
};