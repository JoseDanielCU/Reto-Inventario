import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user"));

  // Si no hay token, redirige a login
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no está autorizado, redirige
  if (allowedRoles && !allowedRoles.includes(userData.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
