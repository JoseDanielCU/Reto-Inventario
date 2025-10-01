import { useEffect, useState } from "react";

export default function AsesorDashboard() {
  const [productos, setProductos] = useState([]);
  const [categorias] = useState(["Celulares", "accesorio", "simcard"]); // estática, o luego la puedes cargar dinámicamente
  const [marcas, setMarcas] = useState([]);

  // filtros
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigo, setCodigo] = useState("");
  const [marca, setMarca] = useState("");

  // 🔹 Obtener productos con filtros
  const fetchProductos = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoria) params.append("categoria", categoria);
      if (codigo) params.append("codigo", codigo);
      if (marca) params.append("marca", marca);

      const res = await fetch(
        `http://localhost:5000/api/lista_productos?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  // 🔹 Obtener marcas únicas desde backend
  const fetchMarcas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lista_productos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
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

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-danger">Catálogo de Productos</h2>

      {/* Barra de búsqueda y filtros */}
      <form className="row mb-4" onSubmit={handleSearch}>
        {/* Nombre */}
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div className="col-md-3 mb-2">
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

        {/* Código */}
        <div className="col-md-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        {/* Marca */}
        <div className="col-md-2 mb-2">
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

        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-danger w-100">
            Filtrar
          </button>
        </div>
      </form>

      {/* Catálogo */}
      <div className="row">
        {productos.map((p) => (
          <div key={p._id} className="col-md-4 mb-4">
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
                <button className="btn btn-danger w-100">
                  Agregar al pedido
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
  );
}
