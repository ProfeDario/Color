import React, { useState, useEffect } from 'react';
import styles from './components.module.css';
import { normalizeName } from '../utils/naming';

export const NameFamilyModal = ({ isOpen, onClose, onSelect }) => {
  const [name, setName] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const suggestions = [
    'brand', 'success', 'error', 'warning', 
    'info', 'neutral', 'accent', 'surface'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSelect(name.trim());
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'var(--text-main)' }}>Nombra la familia de color</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Escribe un nombre único para esta familia. Este nombre se usará al exportar a Figma.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text"
              autoFocus
              className={styles.modalInput}
              placeholder="Ej. Brand Primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sugerencias:</p>
            <div className={styles.suggestionChips}>
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  className={styles.chipButton}
                  onClick={() => setName(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnSubmit} disabled={!name.trim()}>Crear familia</button>
          </div>
        </form>
      </div>
    </div>
  );
};
