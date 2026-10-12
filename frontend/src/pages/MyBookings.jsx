import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    API.get('/bookings/my-bookings').then((res) => setBookings(res.data));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      alert('Error al cancelar la reserva.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Mis Reservas</h2>
      {bookings.length === 0 ? <p>No tienes reservas registradas.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => (
            <div key={b.id} style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px' }}>
              <p><strong>Hotel:</strong> {b.Room?.Hotel?.name} | <strong>Habitación:</strong> {b.Room?.roomType}</p>
              <p><strong>Fechas:</strong> {b.checkInDate} al {b.checkOutDate}</p>
              <p><strong>Total:</strong> \${b.totalPrice}</p>
              <p><strong>Estado:</strong> <span style={{ color: b.status === 'active' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{b.status.toUpperCase()}</span></p>
              {b.status === 'active' && (
                <button onClick={() => handleCancel(b.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar Reserva
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}