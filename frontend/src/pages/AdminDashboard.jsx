import React, { useState } from 'react';
import API from '../api/axiosInstance';

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '', address: '', classification: 5, pricePerNight: '', amenities: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/hotels', formData);
      alert('Hotel agregado exitosamente');
      setFormData({ name: '', address: '', classification: 5, pricePerNight: '', amenities: '' });
    } catch (err) {
      alert('Error al crear el hotel.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2>Panel Admin - Crear Hotel</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input type="text" placeholder="Nombre del hotel" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Dirección" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required style={{ padding: '0.5rem' }} />
        <label>Clasificación (Estrellas):</label>
        <select value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: Number(e.target.value) })} style={{ padding: '0.5rem' }}>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrellas</option>)}
        </select>
        <input type="number" placeholder="Precio base por noche" value={formData.pricePerNight} onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })} required style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Comodidades (WiFi, Piscina, etc.)" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} style={{ padding: '0.5rem' }} />
        <button type="submit" style={{ padding: '0.7rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar Hotel</button>
      </form>
    </div>
  );
}