export const preventImageActions = (e: React.MouseEvent | Event) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

export const initImageProtection = () => {
  // Deshabilitar clic derecho en toda la página
  document.addEventListener('contextmenu', (e) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // Prevenir arrastrar imágenes
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });
};