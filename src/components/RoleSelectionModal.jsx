import React from 'react';
import styles from './components.module.css';

export const RoleSelectionModal = ({ isOpen, onClose, onSelect, usedRoles }) => {
  if (!isOpen) return null;

  const roles = [
    'Primary', 'Secondary', 'Tertiary', 'Success', 
    'Error', 'Warning', 'Info', 'Neutral', 'Custom'
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'var(--text-main)' }}>Selecciona un rol semántico</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Elige el rol para esta nueva familia de color.</p>
        </div>

        <div className={styles.roleGrid}>
          {roles.map(role => {
            const isCustom = role === 'Custom';
            const inUse = !isCustom && usedRoles.includes(role);
            
            return (
              <button
                key={role}
                className={`${styles.roleCard} ${inUse ? styles.roleCardDisabled : ''}`}
                disabled={inUse}
                onClick={() => onSelect(role)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600 }}>{role}</span>
                  {inUse && <span className={styles.inUseChip}>En uso</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};
