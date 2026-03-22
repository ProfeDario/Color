import { SwatchCard } from './SwatchCard';
import styles from './components.module.css';

export const PalettePreview = ({ palette, format }) => {
  if (!palette || palette.length === 0) return null;

  return (
    <div className={styles.paletteGrid}>
      {palette.map((item) => (
        <SwatchCard key={item.tone} tone={item.tone} hex={item.hex} format={format} />
      ))}
    </div>
  );
};
