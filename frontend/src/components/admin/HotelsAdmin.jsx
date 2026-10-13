import { useState } from 'react';
import API from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { errorMessage, formatMoney } from '../../utils/format';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import HotelImage from '../HotelImage';
import StarRating from '../StarRating';
import Icon from '../Icon';

function HotelForm({ hotel, onSaved, onClose }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: hotel?.name || '',
    address: hotel?.address || '',
    classification: hotel?.classification || 4,
    pricePerNight: hotel?.pricePerNight || '',
    amenities: hotel?.amenities || '',
    image: hotel?.image || '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      classification: Number(form.classification),
      pricePerNight: Number(form.pricePerNight),
      image: form.image.trim(),
    };
    try {
      if (hotel) await API.put(`/hotels/${hotel.id}`, payload);
      else await API.post('/hotels', payload);
      toast.success(hotel ? 'Hotel actualizado.' : 'Hotel creado.');
      onSaved();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar el hotel.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={hotel ? 'Editar hotel' : 'Nuevo hotel'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Nombre</span>
          <input type="text" value={form.name} onChange={set('name')} required />
        </label>
        <label className="field">
          <span>Dirección</span>
          <input type="text" value={form.address} onChange={set('address')} required />
        </label>
        <div className="form-row">
          <label className="field">
            <span>Categoría</span>
            <select value={form.classification} onChange={set('classification')}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'estrella' : 'estrellas'}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Precio “desde” por noche</span>
            <input type="number" min="1" step="0.01" value={form.pricePerNight} onChange={set('pricePerNight')} required />
          </label>
        </div>
        <label className="field">
          <span>Comodidades <small className="muted">(separadas por coma)</small></span>
          <input type="text" placeholder="WiFi gratis, Piscina, Desayuno incluido" value={form.amenities} onChange={set('amenities')} />
        </label>
        <label className="field">
          <span>URL de la imagen <small className="muted">(opcional)</small></span>
          <input type="url" placeholder="https://…" value={form.image} onChange={set('image')} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function HotelsAdmin() {
  const toast = useToast();
  const { data: hotels, loading, error, reload } = useApi('/hotels');
  const [editing, setEditing] = useState(null); // null | 'new' | hotel
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await API.delete(`/hotels/${deleting.id}`);
      toast.success('Hotel eliminado.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar el hotel.'));
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2>Hoteles {hotels && <span className="tab-count">{hotels.length}</span>}</h2>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={16} /> Nuevo hotel
        </button>
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" /> <span>{error}</span></div>}
      {loading && !hotels && <div className="sk-block sk-booking" aria-busy="true" />}

      {hotels && (
        <div className={`table-wrap ${loading ? 'is-loading' : ''}`}>
          <table className="data-table">
            <thead>
              <tr><th>Hotel</th><th>Categoría</th><th>Desde</th><th>Habitaciones</th><th className="right">Acciones</th></tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div className="cell-hotel">
                      <HotelImage src={h.image} name={h.name} className="thumb" />
                      <div><strong>{h.name}</strong><div className="muted small">{h.address}</div></div>
                    </div>
                  </td>
                  <td><StarRating value={h.classification} /></td>
                  <td>{formatMoney(h.pricePerNight)}</td>
                  <td>{h.Rooms?.length || 0}</td>
                  <td className="right">
                    <div className="table-actions">
                      <button type="button" className="icon-btn" onClick={() => setEditing(h)} aria-label={`Editar ${h.name}`}><Icon name="edit" /></button>
                      <button type="button" className="icon-btn danger" onClick={() => setDeleting(h)} aria-label={`Eliminar ${h.name}`}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hotels.length === 0 && <tr><td colSpan="5" className="muted center-text">Aún no hay hoteles. Crea el primero.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <HotelForm
          hotel={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Eliminar hotel"
          message={`¿Seguro que quieres eliminar “${deleting.name}” y todas sus habitaciones? Si tiene reservas asociadas no se podrá eliminar.`}
          confirmLabel="Eliminar"
          danger
          loading={busy}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
