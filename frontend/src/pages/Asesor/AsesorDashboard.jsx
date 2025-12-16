import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AsesorNavbar from "../../components/Asesor/NavbarAsesor";

export default function AsesorDashboard() {
  const [carritoCount, setCarritoCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const actualizar = () => {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
      setCarritoCount(total);
    };

    actualizar();

    window.addEventListener("storage", actualizar);

    return () => {
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div>
      <AsesorNavbar carritoCount={carritoCount} user={user} />
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
}
