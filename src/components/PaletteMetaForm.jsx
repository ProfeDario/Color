import styles from './components.module.css';

export const PaletteMetaForm = ({ metadata, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className={styles.metaFormContainer}>
      <div className={styles.metaInputGroup}>
        <label>Nombre de la Familia</label>
        <input 
          type="text" 
          value={metadata.name || ''} 
          onChange={(e) => handleChange('name', e.target.value)} 
          placeholder="Ej. Brand Primary"
        />
      </div>
    </div>
  );
};
