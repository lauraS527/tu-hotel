import { useState } from 'react';
import { addDays, todayISO } from '../utils/format';
import Icon from './Icon';

const EMPTY = { search: '', checkIn: '', checkOut: '', guests: '', stars: '' };

export default function SearchBar({ initial = EMPTY, onSearch, busy = false }) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState('');
  const today = todayISO();

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const handleCheckIn = (e) => {
    const checkIn = e.target.value;
    // La salida siempre debe ser posterior a la llegada
    const checkOut = !values.checkOut || values.checkOut <= checkIn ? addDays(checkIn, 1) : values.checkOut;
    setValues({ ...values, checkIn, checkOut });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Boolean(values.checkIn) !== Boolean(values.checkOut)) {
      setError('Indica la fecha de llegada y la de salida.');
      return;
    }
    if (values.checkIn && values.checkOut <= values.checkIn) {
      setError('La salida debe ser posterior a la llegada.');
      return;
    }
    setError('');
    onSearch(values);
  };

  const handleClear = () => {
    setValues(EMPTY);
    setError('');
    onSearch(EMPTY);
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} aria-label="Buscar hoteles">
      <div className="search-grid">
        <label className="search-field search-field-wide">
          <span><Icon name="pin" size={14} /> Destino</span>
          <input type="text" placeholder="Ciudad, zona o nombre del hotel" value={values.search} onChange={set('search')} />
        </label>
        <label className="search-field">
          <span><Icon name="calendar" size={14} /> Llegada</span>
          <input type="date" min={today} value={values.checkIn} onChange={handleCheckIn} />
        </label>
        <label className="search-field">
          <span><Icon name="calendar" size={14} /> Salida</span>
          <input type="date" min={values.checkIn ? addDays(values.checkIn, 1) : addDays(today, 1)} value={values.checkOut} onChange={set('checkOut')} />
        </label>
        <label className="search-field">
          <span><Icon name="users" size={14} /> Huéspedes</span>
          <select value={values.guests} onChange={set('guests')}>
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
            ))}
          </select>
        </label>
        <label className="search-field">
          <span><Icon name="star" size={14} /> Categoría</span>
          <select value={values.stars} onChange={set('stars')}>
            <option value="">Todas</option>
            <option value="3">3 estrellas o más</option>
            <option value="4">4 estrellas o más</option>
            <option value="5">5 estrellas</option>
          </select>
        </label>
        <div className="search-actions">
          <button type="submit" className="btn btn-accent btn-lg" disabled={busy}>
            <Icon name="search" size={18} /> Buscar
          </button>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="link-btn" onClick={handleClear}>Limpiar búsqueda</button>
    </form>
  );
}
