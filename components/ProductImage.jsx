import React, { useState } from 'react';
import Image from 'next/image';
import { LuxuryFlower } from './Logo';

export default function ProductImage({ 
  src, 
  alt, 
  sizes = "(max-width: 768px) 100vw, 300px", 
  priority = false 
}) {
  const [error, setError] = useState(false);

  // Use the proxy if the URL is external (http/https) to avoid hotlinking issues.
  const finalSrc = src && src.startsWith('http') 
    ? `/api/image-proxy?url=${encodeURIComponent(src)}` 
    : src;

  // Reset error state if the source URL changes
  React.useEffect(() => {
    setError(false);
  }, [finalSrc]);

  // If there's no source at all, treat it as an error
  if (!finalSrc) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF6F0',
      }}>
        <LuxuryFlower width={40} height={40} style={{ opacity: 0.2 }} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#FAF6F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {!error ? (
        <Image
          src={finalSrc}
          alt={alt || "Produit skincare"}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={finalSrc.startsWith('/api/')} // Bypass Next.js optimizer for proxy routes to prevent timeouts
          style={{
            objectFit: 'contain',
            padding: '12%', // Internal padding to prevent cropping and give breathing room
          }}
          onError={(e) => {
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
