import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export function LoginForm({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { correo, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      if (onLogin) onLogin(res.data);

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/asesor");
    } catch (err) {
      console.error(" Error en login:", err);
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form
        className="p-4 rounded shadow"
        style={{ backgroundColor: "#fff", width: "320px" }}
        onSubmit={handleSubmit}
        aria-label="Formulario de inicio de sesión"
      >
        <h2 className="text-center mb-4" style={{ color: "#E60000" }}>
          Iniciar Sesión
        </h2>

        <div className="mb-3">
          <label htmlFor="correo" className="form-label visually-hidden">Correo electrónico</label>
          <input
            id="correo"
            name="correo"
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            aria-label="Correo electrónico"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label visually-hidden">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-label="Contraseña"
            required
          />
        </div>

        <button
          type="submit"
          className="btn w-100"
          style={{ backgroundColor: "#E60000", color: "white" }}
        >
          Ingresar
        </button>

        <p className="text-center mt-3">
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={{ color: "#E60000" }}>
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
