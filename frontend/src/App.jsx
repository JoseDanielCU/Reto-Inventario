import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AsesorDashboard from "./pages/Asesor/AsesorDashboard";
import AsesorCatalogo from "./pages/Asesor/AsesorCatálogo";
import Cart from "./pages/Asesor/Cart.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProductos from "./pages/Admin/AdminProductos";
import AdminSucursales from "./pages/Admin/AdminSucursales";
import AdminPedidos from "./pages/Admin/AdminPedidos";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Asesor */}
        <Route path="/asesor" element={<ProtectedRoute allowedRoles={["asesor"]}><AsesorDashboard /></ProtectedRoute>}
        >
             <Route path="catalogo" element={<AsesorCatalogo/>}/>
        </Route>
        <Route path="/cart" element={<ProtectedRoute allowedRoles={["asesor"]}><Cart /></ProtectedRoute>}
        />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        >
          <Route path="productos" element={<AdminProductos />} />
          <Route path="sucursales" element={<AdminSucursales />} />
            <Route path="pedidos" element={<AdminPedidos/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
