import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import SearchFilter from '../components/SearchFilter';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    API.get('/hotels').then((res) => setHotels(res.data));
  }, []);

  // Lógica de encadenamiento para filtrar hoteles simultáneamente por texto y clasificación
  const filteredHotels = hotels
    .filter((h) => classificationFilter === 'All' || h.classification.toString() === classificationFilter)
    .filter((h) => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.address.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleBookingConfirm = async (bookingData) => {
    try {
      await API.post('/bookings', bookingData);
      alert('¡Reserva realizada con éxito!');
      setSelectedRoom(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar la reserva.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Catálogo de Hoteles</h2>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        classificationFilter={classificationFilter}
        setClassificationFilter={setClassificationFilter}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h3>{hotel.name}</h3>
            <p>📍 {hotel.address}</p>
            <p>⭐ Clasificación: {hotel.classification} estrellas</p>
            <p>💵 Desde ${hotel.pricePerNight} / noche</p>
            <p>✨ Comodidades: {hotel.amenities}</p>
            <h4>Habitaciones Disponibles:</h4>
            {hotel.Rooms?.map((room) => (
              <div key={room.id} style={{ background: '#f9f9f9', padding: '0.5rem', marginBottom: '0.5rem' }}>
                <span>{room.roomType} - ${room.pricePerNight}</span>
                <button
                  style={{ marginLeft: '1rem' }}
                  onClick={() => { setSelectedRoom(room); setSelectedHotel(hotel); }}
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          hotel={selectedHotel}
          onClose={() => setSelectedRoom(null)}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}