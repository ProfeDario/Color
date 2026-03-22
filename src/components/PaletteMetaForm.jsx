import styles from './components.module.css';

export const PaletteMetaForm = ({ metadata, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  const roles = [
    'Primary', 'Secondary', 'Tertiary', 'Success', 
    'Error', 'Warning', 'Info', 'Neutral', 'Custom'
  ];

  return (
    <div className={styles.metaFormContainer}>
      <div className={styles.metaInputGroup}>
        <label>Descriptive Name</label>
        <input 
          type="text" 
          value={metadata.descriptiveName} 
          onChange={(e) => handleChange('descriptiveName', e.target.value)} 
          placeholder="e.g. Vivid Blue"
        />
      </div>
      
      <div className={styles.metaInputGroup}>
        <label>Primitive Token</label>
        <input 
          type="text" 
          value={metadata.primitiveName} 
          onChange={(e) => handleChange('primitiveName', e.target.value)} 
          placeholder="e.g. blue"
        />
      </div>

      <div className={styles.metaInputGroup}>
        <label>Semantic Role</label>
        <select 
          value={metadata.semanticRole} 
          onChange={(e) => handleChange('semanticRole', e.target.value)}
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
