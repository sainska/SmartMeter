import { AuthBackground } from '../auth/AuthBackground';
import { IconMeter } from '../icons';
import styles from './layout.module.css';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className={styles.authShell}>
      <AuthBackground />
      <div className={styles.authCard}>
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>
            <IconMeter size={28} />
          </div>
          {title && <h1 className={styles.authTitle}>{title}</h1>}
          {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
