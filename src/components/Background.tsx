import React from 'react';

interface BackgroundProps {
  imageUrl: string | null;
}

export const Background: React.FC<BackgroundProps> = ({ imageUrl }) => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Background"
          className="w-full h-full object-cover opacity-90"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center text-white/20">
          <span className="text-2xl">No Background Image Selected</span>
        </div>
      )}
      {/* Overlay gradient for better text readability if needed */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};
