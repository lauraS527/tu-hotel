import { useState } from 'react';

// Muestra la imagen del hotel; si no hay o falla, una tarjeta con la inicial.
export default function HotelImage({ src, name, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return <img className={className} src={src} alt={name} loading="lazy" onError={() => setFailedSrc(src)} />;
  }
  return (
    <div className={`${className} img-fallback`} role="img" aria-label={name}>
      <span>{name?.[0]?.toUpperCase() || 'H'}</span>
    </div>
  );
}
