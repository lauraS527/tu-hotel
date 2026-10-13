import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logoutUser();
    close();
    toast.info('Sesión cerrada. ¡Hasta pronto!');
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 21V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15" />
              <path d="M15 11h5a1 1 0 0 1 1 1v9M2 21h20M7 9h4M7 13h4M7 17h4" />
            </svg>
          </span>
          <span className="brand-name">Tu Hotel</span>
        </Link>

        <button type="button" className="icon-btn nav-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menú" aria-expanded={open}>
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>

        <nav className={`nav ${open ? 'open' : ''}`}>
          <NavLink to="/" end className={linkClass} onClick={close}>Hoteles</NavLink>
          {user && <NavLink to="/my-bookings" className={linkClass} onClick={close}>Mis reservas</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass} onClick={close}>Panel admin</NavLink>}

          <div className="nav-user">
            {user ? (
              <>
                <span className="avatar" aria-hidden="true">{user.email[0].toUpperCase()}</span>
                <span className="nav-email">{user.email}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Ingresar</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Crear cuenta</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
