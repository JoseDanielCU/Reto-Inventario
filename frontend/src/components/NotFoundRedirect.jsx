import { Navigate } from "react-router-dom";

export default function NotFoundRedirect() {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rol === "admin") {
    return <Navigate to="/admin/usuarios" replace />;
  }

  if (rol === "asesor") {
    return <Navigate to="/asesor/pedidos" replace />;
  }

  return <Navigate to="/login" replace />;
}
