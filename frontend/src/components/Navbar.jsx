import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#1e293b', color: '#fff', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>🏨 Tu Hotel</h2>
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Catálogo</Link>
        {user ? (
          <>
            <Link to="/my-bookings" style={{ color: '#fff', textDecoration: 'none' }}>Mis Reservas</Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#fbbf24', fontWeight: 'bold', textDecoration: 'none' }}>Panel Admin</Link>
            )}
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>👤 {user.email}</span>
            <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Iniciar Sesión</Link>
            <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none' }}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}