import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import {
  CANCELLATION_HOURS, addDays, errorMessage, formatDate, formatMoney, nightsBetween, todayISO,
} from '../utils/format';
import Modal from './Modal';
import Icon from './Icon';

const STEPS = ['Tus datos', 'Revisar', 'Listo'];

export default function BookingModal({ room, hotel, initialDates, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const today = todayISO();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    guestName: '',
    guestPhone: '',
    guestAddress: '',
    checkInDate: initialDates?.checkIn || '',
    checkOutDate: initialDates?.checkOut || '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const nights = nightsBetween(form.checkInDate, form.checkOutDate);
  const total = nights > 0 ? nights * Number(room.pricePerNight) : 0;

  const handleCheckIn = (e) => {
    const checkInDate = e.target.value;
    const checkOutDate =
      !form.checkOutDate || form.checkOutDate <= checkInDate ? addDays(checkInDate, 1) : form.checkOutDate;
    setForm({ ...form, checkInDate, checkOutDate });
  };

  // Paso 1 → 2: validar y mostrar el resumen
  const handleReview = (e) => {
    e.preventDefault();
    if (nights < 1) {
      setError('La fecha de salida debe ser posterior a la de llegada.');
      return;
    }
    setError('');
    setStep(1);
  };

  // Paso 2 → 3: confirmar
  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await API.post('/bookings', {
        roomId: room.id,
        guestName: form.guestName,
        guestPhone: form.guestPhone,
        guestAddress: form.guestAddress,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
      });
      toast.success('¡Reserva confirmada!');
      setStep(2);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo procesar la reserva.'));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = (
    <dl className="summary">
      <div><dt>Hotel</dt><dd>{hotel.name}</dd></div>
      <div><dt>Habitación</dt><dd>{room.roomType} · Hab. {room.roomNumber}</dd></div>
      <div><dt>Llegada</dt><dd>{form.checkInDate && formatDate(form.checkInDate)}</dd></div>
      <div><dt>Salida</dt><dd>{form.checkOutDate && formatDate(form.checkOutDate)}</dd></div>
      <div><dt>Noches</dt><dd>{nights}</dd></div>
      <div><dt>Huésped</dt><dd>{form.guestName}</dd></div>
      <div><dt>Teléfono</dt><dd>{form.guestPhone}</dd></div>
      <div><dt>Dirección</dt><dd>{form.guestAddress}</dd></div>
      <div className="summary-total"><dt>Total a pagar</dt><dd>{formatMoney(total)}</dd></div>
    </dl>
  );

  return (
    <Modal title={step === 2 ? 'Reserva confirmada' : `Reservar en ${hotel.name}`} onClose={onClose}>
      <ol className="stepper" aria-label="Progreso de la reserva">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? 'current' : i < step ? 'done' : ''}>
            <span className="step-dot">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="step-label">{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form onSubmit={handleReview} className="form">
          <div className="room-pill">
            <strong>{room.roomType}</strong>
            <span>{formatMoney(room.pricePerNight)} / noche</span>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Llegada</span>
              <input type="date" min={today} value={form.checkInDate} onChange={handleCheckIn} required />
            </label>
            <label className="field">
              <span>Salida</span>
              <input type="date" min={form.checkInDate ? addDays(form.checkInDate, 1) : addDays(today, 1)} value={form.checkOutDate} onChange={set('checkOutDate')} required />
            </label>
          </div>

          <label className="field">
            <span>Nombre completo del huésped</span>
            <input type="text" value={form.guestName} onChange={set('guestName')} required autoComplete="name" />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Teléfono</span>
              <input type="tel" value={form.guestPhone} onChange={set('guestPhone')} required minLength={7} autoComplete="tel" />
            </label>
            <label className="field">
              <span>Dirección</span>
              <input type="text" value={form.guestAddress} onChange={set('guestAddress')} required autoComplete="street-address" />
            </label>
          </div>

          {nights > 0 && (
            <p className="total-line">
              {nights} {nights === 1 ? 'noche' : 'noches'} · Total <strong>{formatMoney(total)}</strong>
            </p>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Revisar reserva <Icon name="arrow" size={16} /></button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="form">
          <p className="muted">Revisa los datos antes de confirmar.</p>
          {summary}
          <p className="policy-note">
            <Icon name="info" size={16} /> Cancelación gratuita hasta {CANCELLATION_HOURS} horas antes del check-in.
          </p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(0); }} disabled={submitting}>
              Editar datos
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Confirmando…' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="success-state">
          <span className="success-badge"><Icon name="check" size={32} /></span>
          <h3>¡Todo listo, {form.guestName.split(' ')[0]}!</h3>
          <p className="muted">
            Tu estadía en {hotel.name} del {formatDate(form.checkInDate)} al {formatDate(form.checkOutDate)} quedó reservada.
          </p>
          <div className="modal-actions center">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Seguir explorando</button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/my-bookings')}>Ver mis reservas</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
