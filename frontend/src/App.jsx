import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AsesorDashboard from "./pages/AsesorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/asesor"
          element={
            <ProtectedRoute allowedRoles={["asesor"]}>
              <AsesorDashboard />
            </ProtectedRoute>
          }
        />
          <Route
              path="/cart"
              element={
              <ProtectedRoute allowedRoles={["asesor"]}>
              <Cart />
              </ProtectedRoute>
          }
          />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
