import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export function LoginForm({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔒 Redirección si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.rol) {
      if (user.rol === "admin") {
        navigate("/admin/usuarios", { replace: true });
      } else if (user.rol === "asesor") {
        navigate("/asesor/pedidos", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { correo, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      if (onLogin) onLogin(res.data);

      if (res.data.rol === "admin") {
        navigate("/admin/usuarios", { replace: true });
      } else {
        navigate("/asesor/pedidos", { replace: true });
      }
    } catch (err) {
      console.error("Error en login:", err);
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
          <input
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
      </form>
    </div>
  );
}
