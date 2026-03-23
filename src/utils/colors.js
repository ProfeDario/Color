/**
 * Valida si un string es un HEX válido.
 */
export const isValidHex = (hex) => {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
};

export const hexToRgb = (hex) => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const int = parseInt(cleanHex, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toLowerCase();
};

export const hexToHsl = (hex) => {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toLowerCase();
};

export const getLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  const getLinear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * getLinear(rgb.r) + 0.7152 * getLinear(rgb.g) + 0.0722 * getLinear(rgb.b);
};

export const getContrastColor = (hex) => {
  const L = getLuminance(hex);
  return L > 0.179 ? '#0f172a' : '#ffffff';
};

export const getContrastRatio = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
};

export const generatePalette = (baseHex) => {
  if (!isValidHex(baseHex)) return null;
  const baseHsl = hexToHsl(baseHex);
  
  const palette = [];
  
  // Lighter tones interpolation
  const lightTones = [
    { tone: 50, weight: 0.95 },
    { tone: 100, weight: 0.8 },
    { tone: 200, weight: 0.6 },
    { tone: 300, weight: 0.4 },
    { tone: 400, weight: 0.2 }
  ];

  lightTones.forEach(({ tone, weight }) => {
    const newL = baseHsl.l + (98 - baseHsl.l) * weight;
    const newS = Math.max(0, baseHsl.s - (baseHsl.s * weight * 0.15));
    palette.push({ tone, hex: hslToHex(baseHsl.h, newS, newL) });
  });

  // Base 500 (Color Lock - exactly the input color)
  let baseCleanHex = baseHex;
  if (baseCleanHex.length === 4) {
    baseCleanHex = '#' + baseCleanHex[1]+baseCleanHex[1]+baseCleanHex[2]+baseCleanHex[2]+baseCleanHex[3]+baseCleanHex[3];
  }
  palette.push({ tone: 500, hex: baseCleanHex.toLowerCase() });

  // Darker tones interpolation
  const darkTones = [
    { tone: 600, weight: 0.2 },
    { tone: 700, weight: 0.4 },
    { tone: 800, weight: 0.6 },
    { tone: 900, weight: 0.8 },
    { tone: 950, weight: 0.95 }
  ];

  darkTones.forEach(({ tone, weight }) => {
    const newL = baseHsl.l - (baseHsl.l - 5) * weight;
    const newS = Math.max(0, baseHsl.s - (baseHsl.s * weight * 0.15));
    palette.push({ tone, hex: hslToHex(baseHsl.h, newS, newL) });
  });

  return palette.sort((a,b) => a.tone - b.tone);
};

export const hexToFigmaColorValue = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  let upperHex = hex.toUpperCase();
  if (upperHex.length === 4) {
    upperHex = '#' + upperHex[1]+upperHex[1]+upperHex[2]+upperHex[2]+upperHex[3]+upperHex[3];
  }
  return {
    colorSpace: "srgb",
    components: [
      parseFloat((r / 255).toFixed(6)),
      parseFloat((g / 255).toFixed(6)),
      parseFloat((b / 255).toFixed(6))
    ],
    alpha: 1,
    hex: upperHex
  };
};

import { normalizeName } from './naming';

export const exportFigmaVariables = (families) => {
  const root = {};
  families.forEach(f => {
    const role = normalizeName(f.metadata.name) || 'palette';
    
    const figmaObj = {};
    const palette = generatePalette(f.baseColor);
    if (palette) {
      palette.forEach(p => {
        figmaObj[p.tone] = {
          $type: "color",
          $value: hexToFigmaColorValue(p.hex)
        };
      });
      root[role] = figmaObj;
    }
  });
  return JSON.stringify({ "Base": root }, null, 2);
};
