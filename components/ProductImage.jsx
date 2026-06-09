import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LuxuryFlower } from './Logo';

export default function ProductImage({ src, alt, sizes = "(max-width: 768px) 100vw, 300px", priority = false }) {
  const [error, setError] = useState(false);

  const finalSrc = src && src.startsWith('http')
    ? `/api/image-proxy?url=${encodeURIComponent(src)}`
    : src;

  useEffect(() => {
    setError(false);
  }, [finalSrc]);

  if (!finalSrc) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F4ED' }}>
        <LuxuryFlower width={40} height={40} style={{ opacity: 0.2 }} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#F8F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {!error ? (
        <Image
          src={finalSrc}
          alt={alt || "Produit skincare"}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={finalSrc.startsWith('/api/')}
          style={{ objectFit: 'contain', padding: '8%' }}
          onError={() => {
            console.error("ProductImage load error for:", finalSrc);
            setError(true);
          }}
        />
      ) : (
        <LuxuryFlower width={40} height={40} style={{ opacity: 0.2 }} />
      )}
    </div>
  );
}
