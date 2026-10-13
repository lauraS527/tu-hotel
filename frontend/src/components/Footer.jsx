import { CANCELLATION_HOURS } from '../utils/format';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="brand-name">Tu Hotel</span>
        <span className="muted small">
          Cancelación gratuita hasta {CANCELLATION_HOURS} horas antes del check-in · © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
