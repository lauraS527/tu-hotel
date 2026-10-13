// Política de cancelación (debe coincidir con backend/config/policy.js)
export const CANCELLATION_HOURS = 48;

// Fecha local de hoy en formato AAAA-MM-DD
export const todayISO = () => new Date().toLocaleDateString('en-CA');

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};

export const nightsBetween = (from, to) =>
  from && to ? Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) : 0;

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatMoney = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const amenityList = (text) =>
  (text || '').split(',').map((a) => a.trim()).filter(Boolean);

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

// Estado visible de una reserva: cancelada, pasada o próxima
export const bookingPhase = (b) => {
  if (b.status === 'cancelled') return { key: 'cancelled', label: 'Cancelada', tone: 'danger' };
  if (b.checkOutDate < todayISO()) return { key: 'past', label: 'Finalizada', tone: 'muted' };
  return { key: 'upcoming', label: 'Confirmada', tone: 'success' };
};
