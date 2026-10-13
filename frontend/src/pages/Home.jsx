import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { nightsBetween } from '../utils/format';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import BookingModal from '../components/BookingModal';
import Icon from '../components/Icon';

const EMPTY = { search: '', checkIn: '', checkOut: '', guests: '', stars: '' };

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [applied, setApplied] = useState(EMPTY); // criterios de la última búsqueda
  const [booking, setBooking] = useState(null); // { room, hotel }

  const params = useMemo(
    () => Object.fromEntries(Object.entries(applied).filter(([, value]) => value)),
    [applied]
  );
  const { data: hotels, loading, error, reload } = useApi('/hotels', params);

  const nights = nightsBetween(applied.checkIn, applied.checkOut);
  const hasFilters = Object.keys(params).length > 0;

  const handleReserve = (room, hotel) => {
    if (!user) {
      toast.info('Inicia sesión para completar tu reserva.');
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setBooking({ room, hotel });
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Reserva en minutos</p>
          <h1>Encuentra el lugar perfecto para tu próxima estadía</h1>
          <p className="hero-sub">Compara hoteles, elige tu habitación y confirma tu reserva sin complicaciones.</p>
          <SearchBar initial={EMPTY} onSearch={setApplied} busy={loading} />
        </div>
      </section>

      <section className="container results">
        <div className="results-head">
          <h2>{hasFilters ? 'Resultados de tu búsqueda' : 'Hoteles destacados'}</h2>
          {!loading && hotels && (
            <span className="muted">
              {hotels.length} {hotels.length === 1 ? 'hotel disponible' : 'hoteles disponibles'}
              {nights > 0 && ` · ${nights} ${nights === 1 ? 'noche' : 'noches'}`}
            </span>
          )}
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <Icon name="alert" /> <span>{error}</span>
            <button type="button" className="link-btn" onClick={reload}>Reintentar</button>
          </div>
        )}

        {loading && (
          <div className="hotel-grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="hotel-card skeleton">
                <div className="sk-block sk-img" />
                <div className="sk-block sk-line" />
                <div className="sk-block sk-line short" />
                <div className="sk-block sk-line" />
              </div>
            ))}
          </div>
        )}

        {!loading && hotels?.length === 0 && !error && (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="search" size={28} /></span>
            <h3>No encontramos hoteles con esos criterios</h3>
            <p className="muted">Prueba con otras fechas, menos huéspedes o una categoría distinta.</p>
            <button type="button" className="btn btn-primary" onClick={() => setApplied(EMPTY)}>Ver todos los hoteles</button>
          </div>
        )}

        {!loading && hotels?.length > 0 && (
          <div className="hotel-grid">
            {hotels.map((hotel, i) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} nights={nights} onReserve={handleReserve} />
            ))}
          </div>
        )}
      </section>

      {booking && (
        <BookingModal
          room={booking.room}
          hotel={booking.hotel}
          initialDates={{ checkIn: applied.checkIn, checkOut: applied.checkOut }}
          onClose={() => setBooking(null)}
        />
      )}
    </>
  );
}
