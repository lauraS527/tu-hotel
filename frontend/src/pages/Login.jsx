import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../utils/format';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      loginUser(res.data.user, res.data.token);
      toast.success('¡Bienvenido de nuevo!');
      const fallback = res.data.user.role === 'admin' ? '/admin' : '/';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'No se pudo iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede para reservar y gestionar tus estadías."
      footer={<>¿Aún no tienes cuenta? <Link to="/register">Regístrate</Link></>}
    >
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Correo electrónico</span>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input type="password" value={form.password} onChange={set('password')} required autoComplete="current-password" />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </AuthLayout>
  );
}
