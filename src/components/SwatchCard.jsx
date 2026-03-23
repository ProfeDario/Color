import { useState } from 'react';
import { getContrastColor, getContrastRatio, hexToRgb, hexToHsl } from '../utils/colors';
import styles from './components.module.css';

export const SwatchCard = ({ tone, hex, format = 'HEX' }) => {
  const [copied, setCopied] = useState(false);
  
  const textColor = getContrastColor(hex);
  const ratio = getContrastRatio(hex, textColor);
  const wcagLevel = parseFloat(ratio) >= 7 ? 'AAA' : (parseFloat(ratio) >= 4.5 ? 'AA' : 'Fail');

  let displayValue = hex.toUpperCase();
  if (format === 'RGB') {
    const { r, g, b } = hexToRgb(hex);
    displayValue = `rgb(${r}, ${g}, ${b})`;
  } else if (format === 'HSL') {
    const { h, s, l } = hexToHsl(hex);
    displayValue = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div 
      className={`${styles.swatchCard} ${copied ? styles.swatchCardCopied : ''}`}
      style={{ backgroundColor: hex, color: textColor }}
      onClick={handleCopy}
      title={`Haz click para copiar en ${format}`}
    >
      <div className={styles.swatchInfo}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={styles.toneLabel}>{tone}</span>
          <span className={styles.ratioLabel}>{ratio}:1 {wcagLevel}</span>
        </div>
        <span className={styles.hexLabel}>{copied ? '¡Copiado!' : displayValue}</span>
      </div>
    </div>
  );
};
