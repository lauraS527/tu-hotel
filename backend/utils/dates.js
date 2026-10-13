const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Fecha en formato AAAA-MM-DD válida (y que existe en el calendario)
export const isValidDate = (s) => {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const nightsBetween = (from, to) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

// Primer día reservable. Se permite "ayer en UTC" para no rechazar
// a usuarios cuya fecha local va por detrás de UTC (p. ej. Colombia por la noche).
export const minBookableDate = () =>
  new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

export const hoursUntilDate = (dateStr) => (Date.parse(dateStr) - Date.now()) / 3_600_000;
