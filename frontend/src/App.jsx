import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import AsesorDashboard from "./pages/Asesor/AsesorDashboard";
import AsesorCatalogo from "./pages/Asesor/AsesorCatálogo";
import AsesorPedidos from "./pages/Asesor/AsesorPedidos";
import Cart from "./pages/Asesor/Cart";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProductos from "./pages/Admin/AdminProductos";
import AdminSucursales from "./pages/Admin/AdminSucursales";
import AdminPedidos from "./pages/Admin/AdminPedidos";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";

import ProtectedRoute from "./components/ProtectedRoute";
import RootRedirect from "./components/RootRedirect";
import NotFoundRedirect from "./components/NotFoundRedirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Raíz */}
        <Route path="/" element={<RootRedirect />} />

        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Asesor */}
        <Route
          path="/asesor"
          element={
            <ProtectedRoute allowedRoles={["asesor"]}>
              <AsesorDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="catalogo" element={<AsesorCatalogo />} />
          <Route path="pedidos" element={<AsesorPedidos />} />
        </Route>

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["asesor"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="sucursales" element={<AdminSucursales />} />
          <Route path="pedidos" element={<AdminPedidos />} />
        </Route>

        {/* URL inexistente */}
        <Route path="*" element={<NotFoundRedirect />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
