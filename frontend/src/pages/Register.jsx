import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../utils/format';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/register', { email: form.email, password: form.password });
      toast.success('Cuenta creada. Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear la cuenta.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Solo necesitas un correo y una contraseña."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Correo electrónico</span>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Contraseña <small className="muted">(mínimo 8 caracteres)</small></span>
          <input type="password" value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
        </label>
        <label className="field">
          <span>Confirmar contraseña</span>
          <input type="password" value={form.confirm} onChange={set('confirm')} required minLength={8} autoComplete="new-password" />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
