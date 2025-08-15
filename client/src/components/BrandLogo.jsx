import { useState } from 'react';

function BrandLogo({ brand }) {
  const [imgError, setImgError] = useState(false);
  const imagePath = `../cars/${brand.toLowerCase()}.png`;
  

  return !imgError ? (
    <img
      src={imagePath}
      alt={brand}
      className="w-12 h-12 object-contain rounded-full group-hover:scale-110 transition-transform"
      onError={() => setImgError(true)}
    />
  ) : (
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase group-hover:scale-110 transition-transform">
      {brand[0]}
    </div>
  );
}

export default BrandLogo;
