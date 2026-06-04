const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? response.statusText);
  }
  return response.json();
}

export function fetchHealth() {
  return request('/health');
}

export function fetchMeters() {
  return request('/meters');
}
