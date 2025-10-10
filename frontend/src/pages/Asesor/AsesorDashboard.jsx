import { Outlet } from "react-router-dom";
import AsesorNavbar from "../../components/Asesor/NavbarAsesor";

export default function AdminDashboard() {
  return (
    <div>
      <AsesorNavbar />
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
}