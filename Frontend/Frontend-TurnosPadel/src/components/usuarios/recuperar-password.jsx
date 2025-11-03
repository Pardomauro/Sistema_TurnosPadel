import { useState } from 'react';
import { recuperarContrasena, restablecerContrasena, validarTokenRecuperacion } from '../../api/auth';

const RecuperarPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: Nueva contraseña
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await recuperarContrasena(email);
      setSuccess('Se ha enviado un email con las instrucciones para recuperar tu contraseña');
      setStep(2);
    } catch (err) {
      setError('Error al enviar el email de recuperación');
    }
  };

  const handleValidarToken = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await validarTokenRecuperacion(token);
      setStep(3);
    } catch (err) {
      setError('Token inválido o expirado');
    }
  };

  const handleRestablecerPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await restablecerContrasena(token, password);
      setSuccess('Contraseña actualizada correctamente');
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError('Error al restablecer la contraseña');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Recuperar Contraseña</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSolicitarRecuperacion}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enviar Email de Recuperación
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleValidarToken}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Código de Verificación
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Validar Código
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRestablecerPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Restablecer Contraseña
          </button>
        </form>
      )}
    </div>
  );
};

export default RecuperarPassword;