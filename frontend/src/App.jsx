import { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:3000/api';

let token = '';

const cabeceras = () => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function post(ruta, cuerpo) {
  const res = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify(cuerpo),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

async function get(ruta) {
  const res = await fetch(`${API}${ruta}`, { headers: cabeceras() });
  return res.json();
}

/* ---------- LOGIN ---------- */
function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { ok, data } = await post('/usuarios/login', { correo, password });
      if (!ok) return setError(data.error || 'Error al iniciar sesión');
      token = data.token;
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

/* ---------- PACIENTE ---------- */
function FormPaciente({ usuario }) {
  const vacio = { rut_paciente: '', nombre_paciente: '', fecha_nacimiento: '',
                  nivel_dependencia: 'Leve', direccion: '' };
  const [f, setF] = useState(vacio);
  const [msg, setMsg] = useState(null);

  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const { ok, data } = await post('/pacientes', { ...f, id_usuario: usuario.id_usuario });
      if (ok) {
        setMsg({ tipo: 'ok', texto: `Paciente registrado: ${data.paciente.nombre_paciente}` });
        setF(vacio);
      } else {
        setMsg({ tipo: 'error', texto: data.error || 'No se pudo registrar' });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'No se pudo conectar con el servidor' });
    }
  };

  return (
    <form onSubmit={enviar} className="formulario">
      <h3>Registrar paciente</h3>
      <input name="rut_paciente" placeholder="RUT (ej: 12.345.678-5)" value={f.rut_paciente} onChange={cambiar} required />
      <input name="nombre_paciente" placeholder="Nombre completo" value={f.nombre_paciente} onChange={cambiar} required />
      <label>Fecha de nacimiento
        <input type="date" name="fecha_nacimiento" value={f.fecha_nacimiento} onChange={cambiar} required />
      </label>
      <label>Nivel de dependencia
        <select name="nivel_dependencia" value={f.nivel_dependencia} onChange={cambiar}>
          <option>Leve</option>
          <option>Moderada</option>
          <option>Dependencia Severa</option>
        </select>
      </label>
      <input name="direccion" placeholder="Dirección" value={f.direccion} onChange={cambiar} required />
      <button type="submit">Guardar paciente</button>
      {msg && <p className={msg.tipo === 'ok' ? 'exito' : 'error'}>{msg.texto}</p>}
    </form>
  );
}

/* ---------- CITA ---------- */
function FormCita({ usuario }) {
  const vacio = { rut_paciente: '', fecha_hora: '', especialidad: '', profesional: '' };
  const [f, setF] = useState(vacio);
  const [pacientes, setPacientes] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    get(`/pacientes?id_usuario=${usuario.id_usuario}`)
      .then((lista) => {
        setPacientes(lista);
        if (lista.length > 0) setF((prev) => ({ ...prev, rut_paciente: lista[0].rut_paciente }));
      })
      .catch(() => setMsg({ tipo: 'error', texto: 'No se pudo cargar la lista de pacientes' }));
  }, [usuario.id_usuario]);

  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const { ok, data } = await post('/citas', f);
      if (ok) {
        setMsg({ tipo: 'ok', texto: `Cita agendada (N° ${data.id_cita})` });
        setF({ ...vacio, rut_paciente: f.rut_paciente });
      } else {
        setMsg({ tipo: 'error', texto: data.error || 'No se pudo agendar' });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'No se pudo conectar con el servidor' });
    }
  };

  if (pacientes.length === 0) {
    return <p>Primero registra un paciente en la pestaña "Paciente".</p>;
  }

  return (
    <form onSubmit={enviar} className="formulario">
      <h3>Agendar cita médica</h3>
      <label>Paciente
        <select name="rut_paciente" value={f.rut_paciente} onChange={cambiar}>
          {pacientes.map((p) => (
            <option key={p.rut_paciente} value={p.rut_paciente}>
              {p.nombre_paciente} ({p.rut_paciente})
            </option>
          ))}
        </select>
      </label>
      <label>Fecha y hora
        <input type="datetime-local" name="fecha_hora" value={f.fecha_hora} onChange={cambiar} required />
      </label>
      <input name="especialidad" placeholder="Especialidad (ej: Geriatría)" value={f.especialidad} onChange={cambiar} required />
      <input name="profesional" placeholder="Profesional (ej: Dr. Fuenzalida)" value={f.profesional} onChange={cambiar} required />
      <button type="submit">Agendar cita</button>
      {msg && <p className={msg.tipo === 'ok' ? 'exito' : 'error'}>{msg.texto}</p>}
    </form>
  );
}

/* ---------- TRATAMIENTO ---------- */
function FormTratamiento({ usuario }) {
  const medVacio = { nombre_medicamento: '', concentracion: '', dosis: '', frecuencia_horas: '' };
  const vacio = { rut_paciente: '', descripcion_tratamiento: '', fecha_inicio: '', fecha_fin: '' };
  const [f, setF] = useState(vacio);
  const [meds, setMeds] = useState([{ ...medVacio }]);
  const [pacientes, setPacientes] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    get(`/pacientes?id_usuario=${usuario.id_usuario}`)
      .then((lista) => {
        setPacientes(lista);
        if (lista.length > 0) setF((prev) => ({ ...prev, rut_paciente: lista[0].rut_paciente }));
      })
      .catch(() => setMsg({ tipo: 'error', texto: 'No se pudo cargar la lista de pacientes' }));
  }, [usuario.id_usuario]);

  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const cambiarMed = (i, campo, valor) =>
    setMeds(meds.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)));
  const agregarMed = () => setMeds([...meds, { ...medVacio }]);
  const quitarMed = (i) => setMeds(meds.filter((_, idx) => idx !== i));

  const enviar = async (e) => {
    e.preventDefault();
    setMsg(null);
    const cuerpo = {
      ...f,
      fecha_fin: f.fecha_fin || undefined,
      medicamentos: meds.map((m) => ({ ...m, frecuencia_horas: Number(m.frecuencia_horas) })),
    };
    try {
      const { ok, data } = await post('/tratamientos-completos', cuerpo);
      if (ok) {
        setMsg({ tipo: 'ok', texto: `Tratamiento registrado (N° ${data.id_esquema})` });
        setF({ ...vacio, rut_paciente: f.rut_paciente });
        setMeds([{ ...medVacio }]);
      } else {
        const detalle = data.detalles ? ': ' + data.detalles.join('; ') : '';
        setMsg({ tipo: 'error', texto: (data.error || 'No se pudo registrar') + detalle });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'No se pudo conectar con el servidor' });
    }
  };

  if (pacientes.length === 0) {
    return <p>Primero registra un paciente en la pestaña "Paciente".</p>;
  }

  return (
    <form onSubmit={enviar} className="formulario">
      <h3>Nuevo tratamiento</h3>
      <label>Paciente
        <select name="rut_paciente" value={f.rut_paciente} onChange={cambiar}>
          {pacientes.map((p) => (
            <option key={p.rut_paciente} value={p.rut_paciente}>
              {p.nombre_paciente} ({p.rut_paciente})
            </option>
          ))}
        </select>
      </label>
      <input name="descripcion_tratamiento" placeholder="Descripción (ej: Control de presión arterial)"
             value={f.descripcion_tratamiento} onChange={cambiar} required />
      <label>Fecha de inicio
        <input type="date" name="fecha_inicio" value={f.fecha_inicio} onChange={cambiar} required />
      </label>
      <label>Fecha de término (opcional)
        <input type="date" name="fecha_fin" value={f.fecha_fin} onChange={cambiar} />
      </label>

      <h4 style={{ margin: '8px 0 0' }}>Medicamentos</h4>
      {meds.map((m, i) => (
        <div key={i} className="medicamento">
          <input placeholder="Nombre (ej: Losartán)" value={m.nombre_medicamento}
                 onChange={(e) => cambiarMed(i, 'nombre_medicamento', e.target.value)} required />
          <input placeholder="Concentración (ej: 50 mg comprimidos)" value={m.concentracion}
                 onChange={(e) => cambiarMed(i, 'concentracion', e.target.value)} required />
          <input placeholder="Dosis (ej: 1 comprimido)" value={m.dosis}
                 onChange={(e) => cambiarMed(i, 'dosis', e.target.value)} required />
          <input type="number" min="1" placeholder="Cada cuántas horas" value={m.frecuencia_horas}
                 onChange={(e) => cambiarMed(i, 'frecuencia_horas', e.target.value)} required />
          {meds.length > 1 && (
            <button type="button" className="quitar" onClick={() => quitarMed(i)}>Quitar</button>
          )}
        </div>
      ))}
      <button type="button" className="agregar" onClick={agregarMed}>+ Agregar medicamento</button>

      <button type="submit">Guardar tratamiento</button>
      {msg && <p className={msg.tipo === 'ok' ? 'exito' : 'error'}>{msg.texto}</p>}
    </form>
  );
}

/* ---------- RESUMEN ---------- */
function Resumen({ usuario }) {
  const [citas, setCitas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = usuario.id_usuario;
    Promise.all([
      get(`/citas?id_usuario=${id}`),
      get(`/tratamientos?id_usuario=${id}`),
    ])
      .then(([c, t]) => { setCitas(c); setTratamientos(t); })
      .catch(() => setError('No se pudo cargar el resumen'));
  }, [usuario.id_usuario]);

  const fecha = (f) => (f ? String(f).slice(0, 10) : '—');

  return (
    <div className="resumen">
      {error && <p className="error">{error}</p>}

      <h3>Próximas citas</h3>
      {citas.length === 0 && <p>Sin citas registradas.</p>}
      {citas.map((c) => (
        <div key={c.id_cita} className="item">
          <strong>{c.nombre_paciente}</strong> · {c.especialidad} con {c.profesional}
          <br />
          {new Date(c.fecha_hora).toLocaleString('es-CL')} · {c.estado_cita}
        </div>
      ))}

      <h3>Tratamientos</h3>
      {tratamientos.length === 0 && <p>Sin tratamientos registrados.</p>}
      {tratamientos.map((t) => (
        <div key={t.id_esquema} className="item">
          <strong>{t.nombre_paciente}</strong> · {t.descripcion_tratamiento}
          <br />
          {fecha(t.fecha_inicio)} a {fecha(t.fecha_fin)} · {t.estado_tratamiento}
          <ul>
            {t.medicamentos.map((m, i) => (
              <li key={i}>
                {m.nombre_medicamento} {m.concentracion}: {m.dosis} cada {m.frecuencia_horas} h
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pestana, setPestana] = useState('paciente');

  if (!usuario) return <Login onLogin={setUsuario} />;

  const boton = (clave, texto) => (
    <button className={pestana === clave ? 'activa' : ''} onClick={() => setPestana(clave)}>
      {texto}
    </button>
  );

  return (
    <div className="panel">
      <header>
        <div>
          <strong>{usuario.nombre}</strong> · {usuario.rol}
        </div>
        <button className="secundario"
                onClick={() => { token = ''; setUsuario(null); setPestana('paciente'); }}>
          Cerrar sesión
        </button>
      </header>
      <nav>
        {boton('paciente', 'Paciente')}
        {boton('cita', 'Cita')}
        {boton('tratamiento', 'Tratamiento')}
        {boton('resumen', 'Resumen')}
      </nav>
      {pestana === 'paciente' && <FormPaciente usuario={usuario} />}
      {pestana === 'cita' && <FormCita usuario={usuario} />}
      {pestana === 'tratamiento' && <FormTratamiento usuario={usuario} />}
      {pestana === 'resumen' && <Resumen usuario={usuario} />}
    </div>
  );
}