import React from 'react';

const PREVIEW_SIZES = [12, 14, 16, 20, 24, 32];

export const TypographyPreview = ({
  fontFamily,
  weights,
  primitiveSizes,
  primitiveLineHeights,
}) => {
  const chosenWeight = weights.length > 0 ? weights[0] : 400; // default to first selected weight

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      padding: '1.5rem', 
      border: '1px solid var(--border-color)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem' 
    }}>
      {PREVIEW_SIZES.map(key => {
        const sizePx = primitiveSizes[key];
        const lhPx = primitiveLineHeights[key];

        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)', 
              fontWeight: '500', 
              fontFamily: 'system-ui, sans-serif' 
            }}>
              [ {sizePx}px / {lhPx}px / {chosenWeight} ]
            </div>
            <div style={{
              fontFamily: `"${fontFamily}", sans-serif`,
              fontSize: `${sizePx}px`,
              lineHeight: `${lhPx}px`,
              fontWeight: chosenWeight,
              color: 'var(--text-main)'
            }}>
              Lorem ipsum dolor sit amet
            </div>
          </div>
        );
      })}
    </div>
  );
};
