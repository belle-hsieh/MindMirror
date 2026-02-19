'use client';

import React from 'react';

interface CornerImageProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  src: string;
  alt: string;
  size?: number;
}

const CornerImage: React.FC<CornerImageProps> = ({
  position,
  src,
  alt,
  size = 600,
}) => {
  const styles = {
    position: 'fixed' as const,
    zIndex: 0, // Move above background but below content
    width: `${size}px`,
    height: `${size}px`,
    opacity: 'var(--mm-image-opacity, 0.18)',
  };

  const positionStyles = {
    'top-left': { top: -80, left: -80 },
    'top-right': { top: -80, right: -80 },
    'bottom-left': { bottom: -80, left: -80 },
    'bottom-right': { bottom: -80, right: -80 },
  };

  return (
    <div 
      style={{ ...styles, ...positionStyles[position] }}
      className="relative"
    >
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 object-contain w-full h-full pointer-events-none select-none`}
      />
    </div>
  );
};

export default CornerImage;
