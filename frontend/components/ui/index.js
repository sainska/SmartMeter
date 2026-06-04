import Link from 'next/link';
import styles from './ui.module.css';

export function Card({ title, action, children, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  block,
  sm,
  type = 'button',
  ...props
}) {
  const cls = [
    styles.btn,
    variant === 'primary' && styles.btnPrimary,
    variant === 'secondary' && styles.btnSecondary,
    variant === 'ghost' && styles.btnGhost,
    variant === 'danger' && styles.btnDanger,
    block && styles.btnBlock,
    sm && styles.btnSm,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}

export function InputGroup({ label, children, id }) {
  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function Input({ id, className = '', ...props }) {
  return <input id={id} className={`${styles.input} ${className}`} {...props} />;
}

export function Select({ id, className = '', children, ...props }) {
  return (
    <select id={id} className={`${styles.select} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ id, className = '', ...props }) {
  return (
    <textarea id={id} className={`${styles.textarea} ${className}`} {...props} />
  );
}

export function Badge({ children, variant = 'neutral' }) {
  const map = {
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
    info: styles.badgeInfo,
    neutral: styles.badgeNeutral,
  };
  return (
    <span className={`${styles.badge} ${map[variant]}`}>{children}</span>
  );
}

export function Kpi({ label, value, delta, deltaType }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      {delta && (
        <div
          className={`${styles.kpiDelta} ${
            deltaType === 'up' ? styles.kpiDeltaUp : styles.kpiDeltaDown
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div className={styles.chartBars}>
        {data.map((val, i) => (
          <div
            key={labels?.[i] ?? i}
            className={styles.chartBar}
            style={{ height: `${(val / max) * 100}%` }}
            title={`${val}`}
          />
        ))}
      </div>
      {labels && (
        <div className={styles.chartLabels}>
          {labels.map((l) => (
            <span key={l} className={styles.chartLabel}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Progress({ value }) {
  return (
    <div className={styles.progress}>
      <div className={styles.progressFill} style={{ width: `${value}%` }} />
    </div>
  );
}

export function StatRow({ label, value }) {
  return (
    <div className={styles.statRow}>
      <span className="text-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function ListItem({ icon: Icon, title, subtitle, meta, action, href }) {
  const content = (
    <>
      {Icon && (
        <div className={styles.iconBox}>
          <Icon size={20} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
        {meta}
      </div>
      {action}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.listItem} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
        {content}
      </Link>
    );
  }

  return <div className={styles.listItem}>{content}</div>;
}

export function Toggle({ label, on, onToggle }) {
  return (
    <div className={styles.toggleRow}>
      <span>{label}</span>
      <button
        type="button"
        className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
        onClick={onToggle}
        aria-pressed={on}
      >
        <span className={styles.toggleKnob} />
      </button>
    </div>
  );
}

export function SignalMeter({ strength = 3, max = 5 }) {
  return (
    <div className={styles.signalMeter} aria-label={`Signal ${strength} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`${styles.signalBar} ${i < strength ? styles.signalBarActive : ''}`}
          style={{ height: `${8 + i * 3}px` }}
        />
      ))}
    </div>
  );
}
