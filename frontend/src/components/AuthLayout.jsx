import Icon from './Icon';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-layout">
      <aside className="auth-side">
        <div className="auth-side-inner">
          <h2>Descubre dónde dormir mejor.</h2>
          <ul className="auth-points">
            <li><Icon name="check" size={18} /> Busca por destino, fechas y número de huéspedes</li>
            <li><Icon name="check" size={18} /> Reserva en pocos pasos y revisa antes de confirmar</li>
            <li><Icon name="check" size={18} /> Cancelación gratuita hasta 48 h antes del check-in</li>
          </ul>
        </div>
      </aside>
      <section className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </section>
    </div>
  );
}
