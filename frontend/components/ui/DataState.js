'use client';

export function DataLoading({ message = 'Loading data...' }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
      {message}
    </div>
  );
}

export function DataError({ error, onRetry }) {
  return (
    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</p>
      {onRetry && (
        <button type="button" className="text-sm" onClick={onRetry} style={{ fontWeight: 600 }}>
          Retry
        </button>
      )}
    </div>
  );
}
