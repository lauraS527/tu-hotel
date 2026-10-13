import { useApi } from '../../hooks/useApi';
import { bookingPhase, formatDate, formatMoney } from '../../utils/format';
import Icon from '../Icon';

export default function BookingsAdmin() {
  const { data: bookings, loading, error } = useApi('/bookings');

  return (
    <section>
      <div className="section-head">
        <h2>Todas las reservas {bookings && <span className="tab-count">{bookings.length}</span>}</h2>
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" /> <span>{error}</span></div>}
      {loading && !bookings && <div className="sk-block sk-booking" aria-busy="true" />}

      {bookings && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Hotel · Habitación</th><th>Fechas</th><th>Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const phase = bookingPhase(b);
                return (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>
                      <strong>{b.guestName}</strong>
                      <div className="muted small">{b.User?.email}</div>
                    </td>
                    <td>
                      {b.Room?.Hotel?.name}
                      <div className="muted small">{b.Room?.roomType} · Hab. {b.Room?.roomNumber}</div>
                    </td>
                    <td className="nowrap">{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</td>
                    <td>{formatMoney(b.totalPrice)}</td>
                    <td><span className={`badge badge-${phase.tone}`}>{phase.label}</span></td>
                  </tr>
                );
              })}
              {bookings.length === 0 && <tr><td colSpan="6" className="muted center-text">Todavía no hay reservas.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
