import { useState } from 'react';
import API from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { errorMessage, formatMoney } from '../../utils/format';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import Icon from '../Icon';

const ROOM_TYPES = ['Sencilla', 'Doble', 'Triple', 'Familiar', 'Suite', 'Cabaña'];

function RoomForm({ hotelId, room, onSaved, onClose }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    roomNumber: room?.roomNumber || '',
    roomType: room?.roomType || '',
    capacity: room?.capacity || 2,
    pricePerNight: room?.pricePerNight || '',
    isAvailable: room ? room.isAvailable : true,
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, capacity: Number(form.capacity), pricePerNight: Number(form.pricePerNight) };
    try {
      if (room) await API.put(`/rooms/${room.id}`, payload);
      else await API.post(`/hotels/${hotelId}/rooms`, payload);
      toast.success(room ? 'Habitación actualizada.' : 'Habitación creada.');
      onSaved();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la habitación.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={room ? 'Editar habitación' : 'Nueva habitación'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label className="field">
            <span>Número</span>
            <input type="text" maxLength={20} value={form.roomNumber} onChange={set('roomNumber')} required />
          </label>
          <label className="field">
            <span>Tipo</span>
            <input type="text" list="room-types" value={form.roomType} onChange={set('roomType')} required />
            <datalist id="room-types">{ROOM_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>Capacidad (personas)</span>
            <input type="number" min="1" value={form.capacity} onChange={set('capacity')} required />
          </label>
          <label className="field">
            <span>Precio por noche</span>
            <input type="number" min="1" step="0.01" value={form.pricePerNight} onChange={set('pricePerNight')} required />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
          <span>Habilitada para reservas</span>
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

export default function RoomsAdmin() {
  const toast = useToast();
  const { data: hotels, loading: loadingHotels } = useApi('/hotels');
  const [chosen, setChosen] = useState('');
  const hotelId = chosen || hotels?.[0]?.id || '';

  const { data: rooms, loading, error, reload } = useApi(hotelId ? `/hotels/${hotelId}/rooms` : null);
  const [editing, setEditing] = useState(null); // null | 'new' | room
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggle = async (room) => {
    try {
      await API.put(`/rooms/${room.id}`, { isAvailable: !room.isAvailable });
      toast.success(room.isAvailable ? 'Habitación deshabilitada.' : 'Habitación habilitada.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo actualizar la habitación.'));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await API.delete(`/rooms/${deleting.id}`);
      toast.success('Habitación eliminada.');
      reload();
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar la habitación.'));
    } finally {
      setBusy(false);
      setDeleting(null);
    }
  };

  if (!loadingHotels && hotels?.length === 0) {
    return <div className="empty-state"><h3>Primero crea un hotel</h3><p className="muted">Las habitaciones pertenecen a un hotel.</p></div>;
  }

  return (
    <section>
      <div className="section-head">
        <label className="inline-field">
          <span>Hotel</span>
          <select value={hotelId} onChange={(e) => setChosen(e.target.value)}>
            {hotels?.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')} disabled={!hotelId}>
          <Icon name="plus" size={16} /> Nueva habitación
        </button>
      </div>

      {error && <div className="alert alert-error" role="alert"><Icon name="alert" /> <span>{error}</span></div>}

      {rooms && (
        <div className={`table-wrap ${loading ? 'is-loading' : ''}`}>
          <table className="data-table">
            <thead>
              <tr><th>Número</th><th>Tipo</th><th>Capacidad</th><th>Precio / noche</th><th>Estado</th><th className="right">Acciones</th></tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.roomNumber}</strong></td>
                  <td>{r.roomType}</td>
                  <td>{r.capacity}</td>
                  <td>{formatMoney(r.pricePerNight)}</td>
                  <td>
                    <button type="button" className={`badge badge-btn badge-${r.isAvailable ? 'success' : 'muted'}`} onClick={() => toggle(r)} title="Cambiar estado">
                      {r.isAvailable ? 'Habilitada' : 'Deshabilitada'}
                    </button>
                  </td>
                  <td className="right">
                    <div className="table-actions">
                      <button type="button" className="icon-btn" onClick={() => setEditing(r)} aria-label={`Editar habitación ${r.roomNumber}`}><Icon name="edit" /></button>
                      <button type="button" className="icon-btn danger" onClick={() => setDeleting(r)} aria-label={`Eliminar habitación ${r.roomNumber}`}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && <tr><td colSpan="6" className="muted center-text">Este hotel aún no tiene habitaciones.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RoomForm
          hotelId={hotelId}
          room={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Eliminar habitación"
          message={`¿Eliminar la habitación ${deleting.roomNumber} (${deleting.roomType})? Si tiene reservas asociadas no se podrá eliminar; en ese caso deshabilítala.`}
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
