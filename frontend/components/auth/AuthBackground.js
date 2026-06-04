import styles from './authBackground.module.css';

export function AuthBackground() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.grid} />
      <div className={styles.glow} />
      <div className={styles.ring}>
        <div className={styles.ringInner} />
        <div className={styles.ringTick} />
        <div className={styles.ringTick2} />
        <div className={styles.ringCenter}>
          <span className={styles.reading}>24.8</span>
          <span className={styles.unit}>kWh</span>
        </div>
      </div>
      <div className={styles.waves}>
        <span /><span /><span />
      </div>
      <div className={styles.streams}>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={styles.stream} style={{ '--i': i }} />
        ))}
      </div>
      <div className={styles.nodes}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={styles.node} style={{ '--i': i }} />
        ))}
      </div>
      <div className={styles.scanline} />
    </div>
  );
}
