import { hexToHsl } from './colors';

/**
 * Genera nombres primitivos y descriptivos basados en el HSL.
 */
export const getColorNames = (hex) => {
  const { h, s, l } = hexToHsl(hex);

  // Hue family (Tono Base)
  let baseName = '';
  if (h >= 345 || h < 15) baseName = 'Red';
  else if (h >= 15 && h < 45) baseName = 'Orange';
  else if (h >= 45 && h < 70) baseName = 'Yellow';
  else if (h >= 70 && h < 150) baseName = 'Green';
  else if (h >= 150 && h < 200) baseName = 'Teal';
  else if (h >= 200 && h < 260) baseName = 'Blue';
  else if (h >= 260 && h < 310) baseName = 'Purple';
  else baseName = 'Pink';

  // Saturation modifiers (Intensidad)
  let satModifier = '';
  if (s < 15) {
    baseName = h > 180 && h < 270 ? 'Slate' : 'Gray';
  } else if (s >= 15 && s < 35) {
    satModifier = 'Muted';
  } else if (s > 80) {
    satModifier = 'Vivid';
  }

  // Lightness modifiers (Luminosidad)
  let lightModifier = '';
  if (l < 20) {
    lightModifier = 'Deep';
  } else if (l >= 20 && l < 40) {
    lightModifier = 'Dark';
  } else if (l >= 66 && l < 85) {
    lightModifier = 'Soft';
  } else if (l >= 85) {
    lightModifier = 'Pale';
  }

  const primitive = baseName.toLowerCase();
  
  const descParts = [];
  if (lightModifier) descParts.push(lightModifier);
  if (satModifier && baseName !== 'Gray' && baseName !== 'Slate') descParts.push(satModifier);
  descParts.push(baseName);
  
  const descriptive = descParts.join(' ');

  return { primitive, descriptive };
};
