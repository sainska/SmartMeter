'use client';

import Link from 'next/link';
import { Badge, SignalMeter } from '@/components/ui';
import styles from './fleetMap.module.css';

const STATUS_CLASS = {
  online: styles.cellOnline,
  offline: styles.cellOffline,
  fault: styles.cellFault,
};

export function FleetMap({ meters, onSelect }) {
  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapLegend}>
        <span><i className={`${styles.dot} ${styles.cellOnline}`} /> Online</span>
        <span><i className={`${styles.dot} ${styles.cellOffline}`} /> Offline</span>
        <span><i className={`${styles.dot} ${styles.cellFault}`} /> Fault</span>
      </div>
      <div className={styles.grid} role="grid" aria-label="Regional meter fleet map">
        {meters.map((m) => (
          <Link
            key={m.id}
            href={`/admin/meters/${encodeURIComponent(m.id)}`}
            className={`${styles.cell} ${STATUS_CLASS[m.status]}`}
            style={{ gridColumn: m.lng, gridRow: m.lat }}
            onClick={() => onSelect?.(m.id)}
          >
            <span className={styles.cellId}>{m.id}</span>
            <span className={styles.cellRegion}>{m.region}</span>
            <div className={styles.cellMeta}>
              <SignalMeter strength={m.signal} max={5} />
              <Badge variant={m.status === 'online' ? 'success' : m.status === 'fault' ? 'danger' : 'warning'}>
                {m.battery}%
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
