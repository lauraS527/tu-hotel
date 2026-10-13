import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import {
  CANCELLATION_HOURS, bookingPhase, errorMessage, formatDate, formatMoney, nightsBetween,
} from '../utils/format';
import HotelImage from '../components/HotelImage';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';

const TABS = [
  { key: 'upcoming', label: 'Próximas', empty: 'No tienes reservas próximas.' },
  { key: 'past', label: 'Pasadas', empty: 'Aún no tienes estadías finalizadas.' },
  { key: 'cancelled', label: 'Canceladas', empty: 'No has cancelado ninguna reserva.' },
];

export default function MyBookings() {
  const toast = useToast();
  const { data: bookings, loading, error, reload } = useApi('/bookings/my-bookings');
  const [tab, setTab] = useState('upcoming');
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const list = bookings || [];
  const counts = Object.fromEntries(TABS.map((t) => [t.key, list.filter((b) => bookingPhase(b).key === t.key).length]));
  const visible = list.filter((b) => bookingPhase(b).key === tab);

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await API.put(`/bookings/${toCancel.id}/cancel`);
      toast.success('Reserva cancelada correctamente.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo cancelar la reserva.'));
    } finally {
      setCancelling(false);
      setToCancel(null);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Mis reservas</h1>
          <p className="muted">Consulta tus estadías y cancela si lo necesitas.</p>
        </div>
        <Link to="/" className="btn btn-primary">Buscar hoteles</Link>
      </div>

      <p className="policy-note">
        <Icon name="info" size={16} /> Política de cancelación: gratuita hasta {CANCELLATION_HOURS} horas antes del check-in.
      </p>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" /> <span>{error}</span></div>}
      {loading && !bookings && <div className="sk-block sk-booking" aria-busy="true" />}

      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="calendar" size={28} /></span>
          <h3>{TABS.find((t) => t.key === tab).empty}</h3>
          <Link to="/" className="btn btn-primary">Explorar hoteles</Link>
        </div>
      )}

      <div className="booking-list">
        {visible.map((b, i) => {
          const phase = bookingPhase(b);
          const hotel = b.Room?.Hotel;
          const nights = nightsBetween(b.checkInDate, b.checkOutDate);
          return (
            <article key={b.id} className="booking-card" style={{ '--i': i }}>
              <HotelImage src={hotel?.image} name={hotel?.name || 'Hotel'} className="booking-img" />
              <div className="booking-main">
                <div className="booking-top">
                  <h3>{hotel?.name}</h3>
                  <span className={`badge badge-${phase.tone}`}>{phase.label}</span>
                </div>
                <p className="muted">{b.Room?.roomType} · Hab. {b.Room?.roomNumber}</p>
                <p className="booking-dates">
                  <Icon name="calendar" size={15} /> {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                  <span className="muted"> · {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                </p>
                <p className="muted small">Huésped: {b.guestName} · {b.guestPhone}</p>
              </div>
              <div className="booking-side">
                <span className="booking-total">{formatMoney(b.totalPrice)}</span>
                {phase.key === 'upcoming' && (
                  b.canCancel ? (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setToCancel(b)}>
                      Cancelar reserva
                    </button>
                  ) : (
                    <span className="muted small no-cancel">
                      <Icon name="clock" size={14} /> Fuera del plazo de cancelación
                    </span>
                  )
                )}
              </div>
            </article>
          );
        })}
      </div>

      {toCancel && (
        <ConfirmDialog
          title="¿Cancelar esta reserva?"
          message={`Se cancelará tu reserva en ${toCancel.Room?.Hotel?.name} del ${formatDate(toCancel.checkInDate)} al ${formatDate(toCancel.checkOutDate)}.`}
          confirmLabel="Sí, cancelar"
          cancelLabel="Mantener reserva"
          danger
          loading={cancelling}
          onConfirm={confirmCancel}
          onClose={() => setToCancel(null)}
        />
      )}
    </div>
  );
}
