import React, { useState } from 'react';
import { WEBSAFE_FONTS, SCALES } from '../utils/constants';

export const TypographyControls = ({
  fontFamily, setFontFamily,
  baseSize, setBaseSize,
  scale, setScale,
  weights, setWeights,
  lineHeightAuto, setLineHeightAuto,
  letterSpacingAuto, setLetterSpacingAuto,
  primitiveSizes, setPrimitiveSizes,
  primitiveLineHeights, setPrimitiveLineHeights,
  primitiveLetterSpacings, setPrimitiveLetterSpacings,
  availableFonts = [],
  availableWeights = [300, 400, 500, 600, 700],
  isLoadingFonts = false,
  fontError = null
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleWeight = (w) => {
    if (weights.includes(w)) {
      if (weights.length > 1) { // keep at least one
        setWeights(weights.filter(v => v !== w).sort());
      }
    } else {
      setWeights([...weights, w].sort());
    }
  };

  const updateLH = (k, v) => setPrimitiveLineHeights({ ...primitiveLineHeights, [k]: Number(v) || 0 });
  const updateLS = (k, v) => setPrimitiveLetterSpacings({ ...primitiveLetterSpacings, [k]: v });

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Font Family */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          Font Family
          {isLoadingFonts && <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '0.5rem'}}>(Cargando Google Fonts...)</span>}
        </label>
        {fontError && <div style={{color: '#ef4444', fontSize: '0.75rem'}}>{fontError}</div>}
        <input 
          type="text" 
          list="fonts" 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)} 
          style={{ ...inputStyle, background: isLoadingFonts ? '#f8fafc' : 'white' }}
          placeholder="Busca una tipografía..."
          disabled={isLoadingFonts}
        />
        <datalist id="fonts">
          {availableFonts.length > 0 
            ? availableFonts.map(f => <option key={f.family} value={f.family} />)
            : WEBSAFE_FONTS.map(f => <option key={f} value={f} />)
          }
        </datalist>
      </div>

      {/* Base Size */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={labelStyle}>Base Size</label>
          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{baseSize}px</span>
        </div>
        <input 
          type="range" 
          min="12" max="20" 
          value={baseSize} 
          onChange={(e) => setBaseSize(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      {/* Scale */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Escala tipográfica</label>
          <button 
            onMouseEnter={() => setShowTooltip(true)} 
            onMouseLeave={() => setShowTooltip(false)}
            style={{ 
              background: '#e2e8f0', borderRadius: '50%', width: '18px', height: '18px', 
              fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'help', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
            }}
          >
            ?
          </button>
          
          {showTooltip && SCALES[scale] && (
            <div style={{ 
              position: 'absolute', top: '24px', left: 0, 
              background: '#1e293b', color: 'white', padding: '1rem', 
              borderRadius: '6px', fontSize: '0.85rem', width: '300px', 
              zIndex: 10, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              <div><strong>{SCALES[scale].name}:</strong><br/>{SCALES[scale].description}</div>
            </div>
          )}
        </div>
        
        <select value={scale} onChange={(e) => setScale(Number(e.target.value))} style={inputStyle}>
          {Object.entries(SCALES).map(([ratio, option]) => (
            <option key={ratio} value={ratio}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Font Weights */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Font Weights</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {availableWeights.map(w => (
            <button
              key={w}
              onClick={() => toggleWeight(w)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: weights.includes(w) ? 'var(--primary-color)' : 'var(--border-color)',
                backgroundColor: weights.includes(w) ? '#eff6ff' : 'white',
                color: weights.includes(w) ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: w,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Line Height</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" checked={lineHeightAuto} onChange={() => setLineHeightAuto(true)} /> Automático
          </label>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" checked={!lineHeightAuto} onChange={() => setLineHeightAuto(false)} /> Manual
          </label>
        </div>
        
        {!lineHeightAuto && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Object.keys(primitiveLineHeights).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ width: '30px' }}>{k}px:</span>
                <input 
                  type="number" 
                  value={primitiveLineHeights[k]} 
                  onChange={(e) => updateLH(k, e.target.value)}
                  style={{ ...inputStyle, padding: '0.25rem' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Letter Spacing */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Letter Spacing</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" checked={letterSpacingAuto} onChange={() => setLetterSpacingAuto(true)} /> Automático
          </label>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" checked={!letterSpacingAuto} onChange={() => setLetterSpacingAuto(false)} /> Manual
          </label>
        </div>
        
        {!letterSpacingAuto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {['tight', 'normal', 'wide'].map(type => (
               <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                 <span style={{ width: '50px', textTransform: 'capitalize' }}>{type}:</span>
                 <input 
                   type="text" 
                   value={primitiveLetterSpacings[type]} 
                   onChange={(e) => updateLS(type, e.target.value)}
                   style={{ ...inputStyle, padding: '0.25rem' }}
                 />
               </div>
             ))}
          </div>
        )}
      </div>


      
    </div>
  );
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-main)',
  marginBottom: '0.25rem'
};

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  fontSize: '0.875rem',
  width: '100%',
  fontFamily: 'inherit'
};

const tdInput = {
  ...inputStyle,
  padding: '0.2rem',
  width: '60px',
  marginRight: '0.25rem'
};
