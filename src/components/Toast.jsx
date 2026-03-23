import React from 'react';
import styles from './components.module.css';

export const Toast = ({ message, isVisible }) => {
  return (
    <div className={`${styles.toast} ${isVisible ? styles.toastVisible : ''}`}>
      {message}
    </div>
  );
};
