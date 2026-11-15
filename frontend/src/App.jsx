import { useState } from 'react';
import './App.css';

const API = 'http://localhost:3000/api';

function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Error al iniciar sesión');
      onLogin(data.usuario);
    } catch {
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <form onSubmit={enviar} className="tarjeta">
      <h2>Iniciar sesión</h2>
      <input type="email" placeholder="Correo" value={correo}
             onChange={(e) => setCorreo(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="tarjeta">
      <h2>Bienvenida, {usuario.nombre}</h2>
      <p>Rol: {usuario.rol}</p>
      <button onClick={() => setUsuario(null)}>Cerrar sesión</button>
    </div>
  );
}