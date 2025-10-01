import React from 'react';
import { preventImageActions } from '../lib/imageProtection';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  style,
  onClick 
}) => {
  return (
    <img 
      src={src}
      alt={alt}
      className={`pointer-events-none select-none ${className}`}
      style={style}
      draggable={false}
      onContextMenu={preventImageActions}
      onDragStart={preventImageActions}
      onClick={onClick}
    />
  );
};