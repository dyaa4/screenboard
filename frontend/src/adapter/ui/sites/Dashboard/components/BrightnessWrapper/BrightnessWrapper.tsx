import React from 'react';

interface BrightnessWrapperProps {
  brightness: number | undefined; // Passe dies entsprechend der genauen Struktur an
  children: React.ReactNode;
}

const BrightnessWrapper: React.FC<BrightnessWrapperProps> = ({
  brightness,
  children,
}) => {
  // Die Helligkeit ist ein Wert zwischen 0 und 100
  // Wir teilen durch 100, um den Wert für die CSS-Brightness-Funktion zu erhalten
  const brightnessValue = brightness ? brightness / 100 : 1;

  return (
    <div
      className="absolute"
      style={{ filter: `brightness(${brightnessValue})` }}
    >
      {children}
    </div>
  );
};

export default BrightnessWrapper;
