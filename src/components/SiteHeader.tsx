import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Heart } from 'lucide-react';

interface SiteHeaderProps {
  favoritesCount?: number;
  onMenuToggle?: () => void;
  onFavoritesClick?: (e?: React.MouseEvent) => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ favoritesCount = 0, onMenuToggle, onFavoritesClick }) => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button aria-label="menu" onClick={onMenuToggle} className="p-2 rounded hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-lg font-bold">ESTHER</Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={onFavoritesClick}
              className="relative p-2 hover:bg-gray-100 rounded-md"
              aria-label="Ver favoritos"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Espacio para equilibrar el header (igual que en App.tsx) */}
            <div className="w-24" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;