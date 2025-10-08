import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [sucursales, setSucursales] = useState([]);
  const [message, setMessage] = useState("");

  // Cargar sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sucursales");
        const data = await res.json();
        if (res.ok) {
          setSucursales(Array.isArray(data) ? data : []);
        } else {
          console.error("Error al cargar sucursales:", data.msg);
        }
      } catch (err) {
        console.error("Error al conectar con el servidor de sucursales");
      }
    };

    fetchSucursales();
  }, []);

  // Manejar registro
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          username,
          password,
          sucursal_id: sucursalId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Registro exitoso, rol asignado: ${data.role}`);
        setNombre("");
        setCorreo("");
        setUsername("");
        setPassword("");
        setSucursalId("");
      } else {
        setMessage(`Error: ${data.msg}`);
      }
    } catch (err) {
      setMessage("Error al conectar con el servidor");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form
        className="p-4 rounded shadow"
        style={{ backgroundColor: "#fff", width: "360px" }}
        onSubmit={handleRegister}
        aria-label="Formulario de registro"
      >
        <h2 className="text-center mb-4" style={{ color: "#E60000" }}>
          Registro de Usuario
        </h2>

        {/* Nombre */}
        <div className="mb-3">
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="form-control"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        {/* Correo */}
        <div className="mb-3">
          <input
            id="correo"
            name="correo"
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {/* Username */}
        <div className="mb-3">
          <input
            id="username"
            name="username"
            type="text"
            className="form-control"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="mb-3">
          <input
            id="new-password"
            name="password"
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {/* Selección de sucursal */}
        <div className="mb-3">
          <select
            className="form-select"
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            required
          >
            <option value="">Selecciona una sucursal</option>
            {sucursales.map((suc) => (
              <option key={suc._id} value={suc._id}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn w-100"
          style={{ backgroundColor: "#E60000", color: "white" }}
        >
          Registrarse
        </button>

        {message && (
          <div className="mt-3 alert alert-info" role="status">
            {message}
          </div>
        )}

        <p className="text-center mt-3">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "#E60000" }}>
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
