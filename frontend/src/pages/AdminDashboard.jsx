import { useState } from 'react';
import HotelsAdmin from '../components/admin/HotelsAdmin';
import RoomsAdmin from '../components/admin/RoomsAdmin';
import BookingsAdmin from '../components/admin/BookingsAdmin';

const TABS = [
  { key: 'hotels', label: 'Hoteles', Component: HotelsAdmin },
  { key: 'rooms', label: 'Habitaciones', Component: RoomsAdmin },
  { key: 'bookings', label: 'Reservas', Component: BookingsAdmin },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('hotels');
  const { Component } = TABS.find((t) => t.key === tab);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Panel de administración</h1>
          <p className="muted">Gestiona hoteles, habitaciones y reservas.</p>
        </div>
      </div>

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
            {t.label}
          </button>
        ))}
      </div>

      <Component />
    </div>
  );
}
