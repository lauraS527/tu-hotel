import Modal from './Modal';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="muted">{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </button>
        <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
