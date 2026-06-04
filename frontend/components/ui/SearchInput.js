'use client';

import styles from './ui.module.css';

export function SearchInput({ value, onChange, placeholder = 'Search...', id = 'search' }) {
  return (
    <input
      id={id}
      type="search"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
