import { SCALES } from './constants';

export const SCALES_STEPS = [-2, -1, 0, 1, 2, 3]; // 6 levels mapping to the preview blocks

export const calculateFontSizes = (baseSize, scaleName) => {
  const ratio = SCALES[scaleName] || 1.2;
  return SCALES_STEPS.map(step => {
    return Math.round(baseSize * Math.pow(ratio, step));
  });
};

export const calculateLineHeights = (fontSizes, autoMode) => {
  if (autoMode) {
    // Basic automatic line height (approx 1.5x rounded to nearest multiple of 4, typically)
    return fontSizes.map(size => {
      const lh = Math.round(size * 1.5);
      // Optional round to nearest 4 for 4pt grid
      return Math.round(lh / 4) * 4;
    });
  }
  // Return empty or defaults if not auto, manual logic handled in component state
  return fontSizes.map(size => size + 8);
};

export const typographyToCSS = (tokens) => {
  let css = ':root {\n';
  Object.keys(tokens).forEach(group => {
    Object.keys(tokens[group]).forEach(key => {
      css += `  --${group}-${key.replace(/\./g, '-')}: ${tokens[group][key]};\n`;
    });
  });
  css += '}\n';
  return css;
};

export const typographyToJSON = (tokens) => {
  const result = {
    "font": {
      "family": {},
      "size": {},
      "weight": {},
      "lineHeight": {},
      "letterSpacing": {}
    }
  };

  if (tokens.fontFamily) result.font.family["base"] = { "$value": tokens.fontFamily["base"] };
  
  Object.keys(tokens.fontSize || {}).forEach(key => {
    result.font.size[key] = { "$value": tokens.fontSize[key] };
  });

  Object.keys(tokens.fontWeight || {}).forEach(key => {
    result.font.weight[key] = { "$value": tokens.fontWeight[key] };
  });

  Object.keys(tokens.lineHeight || {}).forEach(key => {
    result.font.lineHeight[key] = { "$value": tokens.lineHeight[key] };
  });

  Object.keys(tokens.letterSpacing || {}).forEach(key => {
    // replace tight/normal/wide if keeping semantic to primitives
    result.font.letterSpacing[key] = { "$value": tokens.letterSpacing[key] };
  });

  return JSON.stringify(result, null, 2);
};

export const typographyToTailwind = (tokens) => {
  const result = {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    letterSpacing: {}
  };

  if (tokens.fontFamily?.["base"]) {
    result.fontFamily["base"] = `"${tokens.fontFamily["base"]}"`;
  }

  // Combine font sizes and line heights if applicable
  Object.keys(tokens.fontSize || {}).forEach(key => {
    const size = tokens.fontSize[key];
    const lh = tokens.lineHeight?.[key];
    if (lh) {
      result.fontSize[key] = `["${size}", "${lh}"]`;
    } else {
      result.fontSize[key] = `"${size}"`;
    }
  });

  Object.keys(tokens.fontWeight || {}).forEach(key => {
    result.fontWeight[key] = `"${tokens.fontWeight[key]}"`;
  });

  Object.keys(tokens.letterSpacing || {}).forEach(key => {
    result.letterSpacing[key] = `"${tokens.letterSpacing[key]}"`;
  });

  const tailwindStr = JSON.stringify(result, null, 2).replace(/"([^"]+)":/g, '$1:');
  
  return `theme: {\n  extend: {\n    ${tailwindStr.replace(/^{|}$/g, '').trim()}\n  }\n}`;
};
