import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminDashboard() {
  return (
    <div>
      <AdminNavbar />
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
}