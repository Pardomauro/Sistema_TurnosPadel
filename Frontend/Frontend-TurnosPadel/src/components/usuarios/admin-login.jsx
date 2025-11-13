import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../api/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Admin login - Intentando con:', { email: formData.email, password: '***' });
      
      // Usar el sistema real de autenticación
      const response = await loginUsuario(formData.email, formData.password);
      console.log('Admin login - Respuesta:', response);
      
      // Verificar que sea un administrador
      if (response.role !== 'administrador') {
        setError('Este usuario no tiene permisos de administrador');
        return;
      }
      
      // Usar el contexto de autenticación
      login({
        userId: response.userId,
        role: response.role,
        token: response.token
      });
      
      console.log('Admin login exitoso, redirigiendo a /admin');
      navigate('/admin');
      
    } catch (err) {
      console.error('Error admin login:', err);
      setError(err.message || 'Credenciales de administrador incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border-l-4 border-purple-500">
      <div className="text-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Acceso Administrador</h2>
        <p className="text-gray-600 mt-2">Ingresa con tus credenciales de administrador</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email de Administrador
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            placeholder=""
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contraseña de Administrador
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            placeholder=""
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white`}
        >
          {loading ? 'Verificando...' : 'Acceder como Admin'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿No eres administrador?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Iniciar Sesión Normal
          </Link>
        </p>
      </div>


    </div>
  );
};

export default AdminLogin;