import { amenityList, formatMoney } from '../utils/format';
import HotelImage from './HotelImage';
import StarRating from './StarRating';
import Icon from './Icon';

const MAX_AMENITIES = 4;

export default function HotelCard({ hotel, index = 0, nights = 0, onReserve }) {
  const amenities = amenityList(hotel.amenities);
  const rooms = hotel.Rooms || [];

  return (
    <article className="hotel-card" style={{ '--i': index }}>
      <div className="hotel-media">
        <HotelImage src={hotel.image} name={hotel.name} className="hotel-img" />
        <span className="badge badge-glass"><StarRating value={hotel.classification} size={13} /></span>
        <span className="price-chip">Desde <strong>{formatMoney(hotel.pricePerNight)}</strong> / noche</span>
      </div>

      <div className="hotel-body">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-address"><Icon name="pin" size={15} /> {hotel.address}</p>

        {amenities.length > 0 && (
          <ul className="chips" aria-label="Comodidades">
            {amenities.slice(0, MAX_AMENITIES).map((a) => <li key={a} className="chip">{a}</li>)}
            {amenities.length > MAX_AMENITIES && <li className="chip chip-more">+{amenities.length - MAX_AMENITIES}</li>}
          </ul>
        )}

        <div className="rooms">
          <h4 className="rooms-title">Habitaciones disponibles</h4>
          {rooms.length === 0 && <p className="muted small">Sin habitaciones disponibles por ahora.</p>}
          {rooms.map((room) => (
            <div key={room.id} className="room-row">
              <div className="room-info">
                <strong>{room.roomType}</strong>
                <span className="muted small">
                  Hab. {room.roomNumber} · <Icon name="users" size={13} /> hasta {room.capacity}
                </span>
              </div>
              <div className="room-price">
                <strong>{formatMoney(room.pricePerNight)}</strong>
                <span className="muted small">
                  {nights > 0 ? `${formatMoney(room.pricePerNight * nights)} por ${nights} ${nights === 1 ? 'noche' : 'noches'}` : 'por noche'}
                </span>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onReserve(room, hotel)}>
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
