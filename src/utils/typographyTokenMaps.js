export const FONT_WEIGHT_NAME_MAP = {
  100: "thin",
  200: "extralight",
  300: "light",
  400: "regular",
  500: "medium",
  600: "semibold",
  700: "bold",
  800: "extrabold",
  900: "black"
};

export const getTypographyScaleNames = (length) => {
  switch (length) {
    case 1: return ['base'];
    case 2: return ['s', 'm'];
    case 3: return ['s', 'm', 'l'];
    case 4: return ['s', 'm', 'l', 'xl'];
    case 5: return ['xs', 's', 'm', 'l', 'xl'];
    case 6: return ['xs', 's', 'm', 'l', 'xl', '2xl'];
    case 7: return ['xxs', 'xs', 's', 'm', 'l', 'xl', '2xl'];
    case 8: return ['xxs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
    case 9: return ['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
    default:
      return Array.from({ length }, (_, i) => `step-${i + 1}`);
  }
};

export const mapValuesToScale = (valuesObj) => {
  const values = Object.values(valuesObj)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);
    
  const names = getTypographyScaleNames(values.length);
  
  const result = {};
  values.forEach((val, index) => {
    result[names[index]] = {
      $value: val,
      $type: "number"
    };
  });
  
  return result;
};
