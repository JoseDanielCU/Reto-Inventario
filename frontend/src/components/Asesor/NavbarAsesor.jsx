import { Link, useNavigate } from "react-router-dom";

export default function NavbarAsesor({ carritoCount = 0, user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/asesor">
          Panel de Asesor
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarAsesor"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarAsesor">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/asesor/pedidos">
                Mis pedidos
              </Link>
            </li>
              <li className="nav-item">
              <Link className="nav-link" to="/asesor/Catalogo">
                Catálogo
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            {/* Carrito */}
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                🛒 Carrito ({carritoCount})
              </Link>
            </li>

            {/* Usuario */}
            {user?.correo && (
              <li className="nav-item d-flex align-items-center px-2 text-light">
                <i className="bi bi-person-circle me-2"></i>
                {user.correo}
              </li>
            )}

            {/* Logout */}
            <li className="nav-item">
              <button className="btn btn-light btn-sm ms-2" onClick={logout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
