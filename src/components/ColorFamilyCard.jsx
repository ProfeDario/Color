import { ColorInput } from './ColorInput';
import { PaletteMetaForm } from './PaletteMetaForm';
import { PalettePreview } from './PalettePreview';
import { generatePalette } from '../utils/colors';
import styles from './components.module.css';

export const ColorFamilyCard = ({ family, updateFamily, removeFamily, format }) => {
  const palette = generatePalette(family.baseColor) || [];

  return (
    <div className={styles.familyCardContainer}>
      <div className={styles.familyCardHeader} onClick={() => updateFamily(family.id, { isExpanded: !family.isExpanded })}>
        <div className={styles.familyTitle}>
          <h3>{family.metadata.name || 'Sin Nombre'}</h3>
        </div>
        
        {!family.isExpanded && palette.length > 0 && (
          <div className={styles.miniPreviewRow}>
            {palette.map(p => (
              <div 
                key={p.tone} 
                className={`${styles.miniSwatch} ${p.tone === 500 ? styles.miniSwatch500 : ''}`} 
                style={{ backgroundColor: p.hex }}
                title={`Tone ${p.tone}: ${p.hex.toUpperCase()}`}
              />
            ))}
          </div>
        )}

        <div className={styles.headerActions}>
          <button className={styles.btnToggleView}>{family.isExpanded ? 'Colapsar' : 'Expandir'}</button>
          <button className={styles.btnRemove} onClick={(e) => { e.stopPropagation(); removeFamily(family.id); }}>Eliminar</button>
        </div>
      </div>

      {family.isExpanded && (
        <div className={styles.familyCardBody}>
          <div style={{ display: 'flex', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <ColorInput 
              color={family.baseColor} 
              onChange={(hex) => updateFamily(family.id, { baseColor: hex })} 
            />
          </div>
          <PaletteMetaForm 
            metadata={family.metadata} 
            onChange={(meta) => updateFamily(family.id, { metadata: meta })} 
          />
          <PalettePreview palette={palette} format={format} />
        </div>
      )}
    </div>
  );
};
