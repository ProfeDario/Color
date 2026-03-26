export const fetchGoogleFonts = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    throw new Error('API Key no encontrada. Verifica tu VITE_GOOGLE_FONTS_API_KEY en .env');
  }

  const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error('Error al conectar con la API de Google Fonts');
  }
  
  const data = await res.json();
  return data.items || [];
};

export const normalizeWeights = (variants) => {
  if (!variants || !Array.isArray(variants)) return [400];
  
  const weights = new Set();
  
  variants.forEach(v => {
    if (v === 'regular') {
      weights.add(400);
    } else if (v === 'italic') {
      // Ignorar el italic puro para los chips numericos si queremos simplificar, 
      // pero usualmente regular = 400.
    } else {
      const num = parseInt(v, 10);
      if (!isNaN(num)) {
        weights.add(num);
      }
    }
  });

  const result = Array.from(weights).sort((a, b) => a - b);
  // Fallback si la fuente no tuviera pesos regulares númericos reconocibles (muy raro)
  return result.length > 0 ? result : [400];
};

export const loadFont = (family, weightsToLoad) => {
  if (!family) return;
  const fontToRequest = family.replace(/ /g, '+');
  
  // Construir la cadena de pesos (ej: 300;400;700)
  const weightsString = weightsToLoad && weightsToLoad.length > 0 
    ? `:wght@${weightsToLoad.join(';')}` 
    : '';
    
  const url = `https://fonts.googleapis.com/css2?family=${fontToRequest}${weightsString}&display=swap`;
  
  const id = `font-${fontToRequest}`;
  let link = document.getElementById(id);
  
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  if (link.href !== url) {
    link.href = url;
  }
};
