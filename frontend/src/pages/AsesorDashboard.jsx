import { useState, useEffect } from "react";

export default function AsesorDashboard() {
  const [productos, setProductos] = useState([]);
  const [categorias] = useState(["celular", "accesorio", "simcard"]);
  const [marcas, setMarcas] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigo, setCodigo] = useState("");
  const [marca, setMarca] = useState("");

  // carrito
  const [carrito, setCarrito] = useState([]);

  // info usuario
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const fetchProductos = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoria) params.append("categoria", categoria);
      if (codigo) params.append("codigo", codigo);
      if (marca) params.append("marca", marca);

      const res = await fetch(
        `http://localhost:5000/api/productos?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  const fetchMarcas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lista_productos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const marcasUnicas = [...new Set(data.map((p) => p.marca).filter(Boolean))];
      setMarcas(marcasUnicas);
    } catch (err) {
      console.error("Error al cargar marcas:", err);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchMarcas();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProductos();
  };

  const addToCart = (producto) => {
    setCarrito([...carrito, producto]);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Catálogo
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Inicio
                </a>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto">
              {/* Carrito */}
              <li className="nav-item">
                <a className="nav-link" href="/carrito">
                  Carrito ({carrito.length})
                </a>
              </li>

              {/* Usuario */}
              {user?.correo && (
                <li className="nav-item">
                  <span className="nav-link">{user.correo}</span>
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="container-fluid py-4 flex-grow-1">
        <h2 className="mb-4 text-danger">Catálogo de Productos</h2>

        {/* FILTROS */}
        <form className="row mb-4 g-2" onSubmit={handleSearch}>
          <div className="col-12 col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <button type="submit" className="btn btn-danger w-100">
              Filtrar
            </button>
          </div>
        </form>

        {/* CATÁLOGO */}
        <div className="row">
          {productos.map((p) => (
            <div key={p._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={p.imagen || "https://via.placeholder.com/150"}
                  className="card-img-top"
                  alt={p.nombre}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.nombre}</h5>
                  <p className="card-text">
                    Modelo: {p.modelo || "N/A"} <br />
                    Categoría: {p.categoria} <br />
                    Marca: {p.marca || "N/A"} <br />
                    Código: {p.codigo || "N/A"}
                  </p>
                  <button
                    className="btn btn-danger w-100"
                    onClick={() => addToCart(p)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productos.length === 0 && (
          <p className="text-center text-muted">No se encontraron productos</p>
        )}
      </div>
    </div>
  );
}
