import React, { useState } from 'react';

export default function BookingModal({ room, hotel, onClose, onConfirm }) {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      roomId: room.id,
      guestName,
      guestPhone,
      guestAddress,
      checkInDate,
      checkOutDate,
      totalPrice: room.pricePerNight
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '420px', maxWidth: '90%' }}>
        <h3>Confirmar Reserva</h3>
        <p><strong>Hotel:</strong> {hotel.name}</p>
        <p><strong>Habitación:</strong> {room.roomType} (${room.pricePerNight}/noche)</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input type="text" placeholder="Nombre completo del huésped" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input type="tel" placeholder="Teléfono de contacto" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required style={{ padding: '0.5rem' }} />
          <input type="text" placeholder="Dirección de residencia" value={guestAddress} onChange={(e) => setGuestAddress(e.target.value)} required style={{ padding: '0.5rem' }} />
          <label>Fecha de Check-in:</label>
          <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required style={{ padding: '0.5rem' }} />
          <label>Fecha de Check-out:</label>
          <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required style={{ padding: '0.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}