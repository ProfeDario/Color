import styles from './components.module.css';

export const ColorInput = ({ color, onChange }) => {
  const handleTextChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) {
      val = '#' + val;
    }
    onChange(val);
  };

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="color-picker" className={styles.label}>Base ColorHEX</label>
      <div className={styles.inputGroup}>
        <input 
          id="color-picker"
          type="color" 
          value={color} 
          onChange={(e) => onChange(e.target.value)} 
          className={styles.colorPicker}
          title="Choose your color"
        />
        <input 
          type="text" 
          value={color} 
          onChange={handleTextChange} 
          className={styles.textInput}
          maxLength={7}
          placeholder="#3b82f6"
        />
      </div>
    </div>
  );
};
