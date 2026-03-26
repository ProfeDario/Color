import React, { useState, useEffect } from 'react';
import { TypographyControls } from './TypographyControls';
import { TypographyPreview } from './TypographyPreview';
import { SCALES } from '../utils/constants';
import { FONT_WEIGHT_NAME_MAP, mapValuesToScale } from '../utils/typographyTokenMaps';

const defaultSizes = {
  12: 12, 14: 14, 16: 16, 20: 20, 24: 24, 32: 32
};

const defaultLineHeights = {
  12: 18, 14: 21, 16: 24, 20: 30, 24: 36, 32: 48
};

export const TypographyScreen = ({ triggerToast }) => {
  const [fontFamily, setFontFamily] = useState('Inter');
  const [baseSize, setBaseSize] = useState(16);
  const [scale, setScale] = useState(1.2);
  const [weights, setWeights] = useState([400]);
  
  const [lineHeightAuto, setLineHeightAuto] = useState(true);
  const [letterSpacingAuto, setLetterSpacingAuto] = useState(true);

  const [primitiveSizes, setPrimitiveSizes] = useState({ ...defaultSizes });
  const [primitiveLineHeights, setPrimitiveLineHeights] = useState({ ...defaultLineHeights });
  const [primitiveLetterSpacings, setPrimitiveLetterSpacings] = useState({
    tight: '-0.025em', normal: '0em', wide: '0.025em'
  });

  const [availableFonts, setAvailableFonts] = useState([]);
  const [availableWeights, setAvailableWeights] = useState([400, 700]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    import('../utils/googleFonts').then(({ fetchGoogleFonts, normalizeWeights }) => {
      fetchGoogleFonts()
        .then(fonts => {
          setAvailableFonts(fonts);
          setIsLoadingFonts(false);
          const initialFont = fonts.find(f => f.family === fontFamily) || fonts[0];
          if (initialFont) {
            const w = normalizeWeights(initialFont.variants);
            setAvailableWeights(w);
            setWeights(prev => {
              const valid = prev.filter(p => w.includes(p));
              return valid.length > 0 ? valid : [w[0] || 400];
            });
          }
        })
        .catch(err => {
          setFontError(err.message);
          setIsLoadingFonts(false);
        });
    });
  }, []);

  useEffect(() => {
    if (availableFonts.length > 0) {
      const selectedFont = availableFonts.find(f => f.family === fontFamily);
      if (selectedFont) {
        import('../utils/googleFonts').then(({ normalizeWeights }) => {
          const w = normalizeWeights(selectedFont.variants);
          setAvailableWeights(w);
          setWeights(prev => {
            const valid = prev.filter(p => w.includes(p));
            return valid.length > 0 ? valid : [w[0] || 400];
          });
        });
      }
    }
  }, [fontFamily, availableFonts]);

  useEffect(() => {
    import('../utils/googleFonts').then(({ loadFont }) => {
      loadFont(fontFamily, availableWeights);
    });
  }, [fontFamily, availableWeights]);

  useEffect(() => {
    const ratio = Number(scale) || 1.2;
    const newSizes = {
      12: Math.round(baseSize * Math.pow(ratio, -2)),
      14: Math.round(baseSize * Math.pow(ratio, -1)),
      16: baseSize, 
      20: Math.round(baseSize * Math.pow(ratio, 1)),
      24: Math.round(baseSize * Math.pow(ratio, 2)),
      32: Math.round(baseSize * Math.pow(ratio, 3))
    };
    setPrimitiveSizes(newSizes);

    if (lineHeightAuto) {
      const newLineHeights = {};
      Object.keys(newSizes).forEach(k => {
        const size = newSizes[k];
        newLineHeights[k] = Math.round((size * 1.5) / 4) * 4;
      });
      setPrimitiveLineHeights(newLineHeights);
    }
  }, [baseSize, scale, lineHeightAuto]);

  const handleExport = (format) => {
    let result = '';
    let ext = 'txt';
    let mime = 'text/plain';
    let downloadName = 'typography-tokens';

    const tokens = {
      fontFamily: { base: fontFamily },
      fontSize: primitiveSizes,
      fontWeight: weights.reduce((acc, w) => ({...acc, [w]: w}), {}),
      lineHeight: primitiveLineHeights,
      letterSpacing: primitiveLetterSpacings
    };

    if (format === 'JSON') {
      const obj = { font: { family: { base: { $value: tokens.fontFamily.base } }, size: {}, weight: {}, lineHeight: {}, letterSpacing: {} } };
      Object.keys(tokens.fontSize).forEach(k => obj.font.size[k] = { $value: `${tokens.fontSize[k]}px` });
      Object.keys(tokens.fontWeight).forEach(k => obj.font.weight[k] = { $value: `${tokens.fontWeight[k]}` });
      Object.keys(tokens.lineHeight).forEach(k => obj.font.lineHeight[k] = { $value: `${tokens.lineHeight[k]}px` });
      Object.keys(tokens.letterSpacing).forEach(k => obj.font.letterSpacing[k] = { $value: `${tokens.letterSpacing[k]}` });
      result = JSON.stringify(obj, null, 2);
      ext = 'json';
      mime = 'application/json';
    } else if (format === 'CSS Variables') {
      result = ':root {\n';
      result += `  --font-family-base: '${tokens.fontFamily.base}';\n`;
      Object.keys(tokens.fontSize).forEach(k => result += `  --font-size-${k}: ${tokens.fontSize[k]}px;\n`);
      Object.keys(tokens.fontWeight).forEach(k => result += `  --font-weight-${k}: ${tokens.fontWeight[k]};\n`);
      Object.keys(tokens.lineHeight).forEach(k => result += `  --line-height-${k}: ${tokens.lineHeight[k]}px;\n`);
      Object.keys(tokens.letterSpacing).forEach(k => result += `  --letter-spacing-${k}: ${tokens.letterSpacing[k]};\n`);
      result += '}\n';
      ext = 'css';
    } else if (format === 'Tailwind') {
      const twObj = {
        fontFamily: { sans: `['${tokens.fontFamily.base}']` },
        fontSize: {}, fontWeight: {}, letterSpacing: {}
      };
      Object.keys(tokens.fontSize).forEach(k => {
        twObj.fontSize[k] = `['${tokens.fontSize[k]}px', '${tokens.lineHeight[k]}px']`;
      });
      Object.keys(tokens.fontWeight).forEach(k => twObj.fontWeight[k] = `"${tokens.fontWeight[k]}"`);
      Object.keys(tokens.letterSpacing).forEach(k => twObj.letterSpacing[k] = `"${tokens.letterSpacing[k]}"`);
      
      const twStr = JSON.stringify(twObj, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"\['([^']+)', '([^']+)'\]"/g, "['$1', '$2']").replace(/"\['([^']+)'\]"/g, "['$1']");
      result = `module.exports = {\n  theme: {\n    extend: {\n      ${twStr.replace(/^{|}$/g, '').trim()}\n    }\n  }\n}`;
      ext = 'js';
    } else if (format === 'Figma Variables') {
      const sizeObj = mapValuesToScale(tokens.fontSize);
      const lineHeightObj = mapValuesToScale(tokens.lineHeight);
      const letterSpacingObj = mapValuesToScale(tokens.letterSpacing);

      const weightObj = {};
      const sortedWeights = Object.values(tokens.fontWeight).map(v => Number(v)).sort((a, b) => a - b);
      sortedWeights.forEach(w => {
        const name = FONT_WEIGHT_NAME_MAP[w] || String(w);
        weightObj[name] = { $value: w, $type: "number" };
      });

      const obj = {
        Typography: {
          "font-family": {
            main: { $value: tokens.fontFamily.base, $type: "string" }
          },
          size: sizeObj,
          "font-weight": weightObj,
          "line-height": lineHeightObj,
          "letter-spacing": letterSpacingObj
        }
      };

      result = JSON.stringify(obj, null, 2);
      ext = 'json';
      mime = 'application/json';
      downloadName = 'typography-figma-variables';
    } else if (format === 'Copy') {
      // Just copy JSON to clipboard
      const obj = { font: { family: { base: { $value: tokens.fontFamily.base } }, size: {}, weight: {}, lineHeight: {}, letterSpacing: {} } };
      Object.keys(tokens.fontSize).forEach(k => obj.font.size[k] = { $value: `${tokens.fontSize[k]}px` });
      Object.keys(tokens.fontWeight).forEach(k => obj.font.weight[k] = { $value: `${tokens.fontWeight[k]}` });
      Object.keys(tokens.lineHeight).forEach(k => obj.font.lineHeight[k] = { $value: `${tokens.lineHeight[k]}px` });
      Object.keys(tokens.letterSpacing).forEach(k => obj.font.letterSpacing[k] = { $value: `${tokens.letterSpacing[k]}` });
      
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      triggerToast('Tokens copiados al portapapeles');
      return;
    }

    const blob = new Blob([result], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: '2rem', width: '100%' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', minHeight: '600px', alignItems: 'start' }}>
        <TypographyControls 
          fontFamily={fontFamily} setFontFamily={setFontFamily}
          baseSize={baseSize} setBaseSize={setBaseSize}
          scale={scale} setScale={setScale}
          weights={weights} setWeights={setWeights}
          lineHeightAuto={lineHeightAuto} setLineHeightAuto={setLineHeightAuto}
          letterSpacingAuto={letterSpacingAuto} setLetterSpacingAuto={setLetterSpacingAuto}
          primitiveSizes={primitiveSizes} setPrimitiveSizes={setPrimitiveSizes}
          primitiveLineHeights={primitiveLineHeights} setPrimitiveLineHeights={setPrimitiveLineHeights}
          primitiveLetterSpacings={primitiveLetterSpacings} setPrimitiveLetterSpacings={setPrimitiveLetterSpacings}
          availableFonts={availableFonts}
          availableWeights={availableWeights}
          isLoadingFonts={isLoadingFonts}
          fontError={fontError}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TypographyPreview 
            fontFamily={fontFamily}
            weights={weights}
            primitiveSizes={primitiveSizes}
            primitiveLineHeights={primitiveLineHeights}
            primitiveLetterSpacings={primitiveLetterSpacings}
          />

          <div style={{ 
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap', 
            background: 'white', padding: '1rem', borderRadius: '8px', 
            border: '1px solid var(--border-color)', justifyContent: 'flex-start' 
          }}>
            <button onClick={() => handleExport('JSON')} style={exportBtnStyle}>JSON</button>
            <button onClick={() => handleExport('CSS Variables')} style={exportBtnStyle}>CSS Variables</button>
            <button onClick={() => handleExport('Tailwind')} style={exportBtnStyle}>Tailwind config</button>
            <button onClick={() => handleExport('Figma Variables')} style={exportBtnStyle}>Exportar Figma Variables</button>
            <button onClick={() => handleExport('Copy')} style={{ ...exportBtnStyle, marginLeft: 'auto', background: 'var(--primary-color)', color: 'white', border: 'none' }}>
              Copiar tokens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const exportBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  background: 'white',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-main)',
  transition: 'background 0.2s',
};
