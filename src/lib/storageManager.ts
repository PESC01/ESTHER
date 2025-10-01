export class StorageManager {
  
  // Obtener el tamaño total de imágenes almacenadas
  static getStorageSize(): { count: number; sizeKB: number } {
    let count = 0;
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_')) {
        count++;
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
    }
    
    return {
      count,
      sizeKB: Math.round(totalSize / 1024)
    };
  }
  
  // Limpiar todas las imágenes
  static clearAllImages(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
   
  }
  
  // Listar todas las imágenes almacenadas (ahora todas están en products/)
  static listStoredImages(): { products: string[], sections: string[] } {
    const products: string[] = [];
    const sections: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_')) {
        const imagePath = key.replace('image_', '');
        if (imagePath.startsWith('products/')) {
          // Todas las imágenes ahora están en products, pero podemos distinguir por nombre
          products.push(imagePath);
        }
      }
    }
    
    return { products, sections };
  }
  
  // Método para migrar imágenes existentes de sections/ a products/
  static migrateExistingSectionImages(): void {
    const keysToMigrate: { oldKey: string, newKey: string, data: string }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('image_sections/')) {
        const data = localStorage.getItem(key);
        if (data) {
          const newPath = key.replace('image_sections/', 'image_products/');
          keysToMigrate.push({
            oldKey: key,
            newKey: newPath,
            data: data
          });
        }
      }
    }
    
    // Realizar la migración
    keysToMigrate.forEach(({ oldKey, newKey, data }) => {
      localStorage.setItem(newKey, data);
      localStorage.removeItem(oldKey);
    });
    
    if (keysToMigrate.length > 0) {
     
    }
  }
}

// Ejecutar migración automáticamente al cargar el módulo
StorageManager.migrateExistingSectionImages();