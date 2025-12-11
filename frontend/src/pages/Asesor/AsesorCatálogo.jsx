import { useEffect, useState } from "react";

export default function AsesorCatalogo() {
const [productos, setProductos] = useState([]);
  const [categorias] = useState(["Celulares", "Accesorio", "Simcard"]);
  const [marcas, setMarcas] = useState(["Apple","Samsung","Xiaomi","Motorola","Huawei","VIVO",]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigo, setCodigo] = useState("");
  const [marca, setMarca] = useState("");
  const [coloresSeleccionados, setColoresSeleccionados] = useState({});

  // carrito

    const [carrito, setCarrito] = useState(() => {
      const saved = localStorage.getItem("carrito");
      return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
      localStorage.setItem("carrito", JSON.stringify(carrito));
    }, [carrito]);

    const [cantidades, setCantidades] = useState({});

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
      const res = await fetch("http://localhost:5000/api/productos", {
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

    const handleCantidadChange = (id, value) => {
    setCantidades({ ...cantidades, [id]: parseInt(value) || 1 });
  };

  const addToCart = (producto) => {
  const cantidad = cantidades[producto._id] || 1;
  const colores = coloresSeleccionados[producto._id] || [];

  setCarrito((prev) => {
    let nuevo = [...prev];

    // Caso sin colores → item único basado solo en _id
    if (colores.length === 0) {
      const uniqueId = producto._id + "_default";

      const existente = nuevo.find((x) => x._uniqueId === uniqueId);

      if (existente) {
        existente.cantidad += cantidad;
      } else {
        nuevo.push({
          ...producto,
          cantidad,
          colores: [],
          _uniqueId: uniqueId,
        });
      }

      return nuevo;
    }

    // Caso con varios colores → cada color es un item independiente
    colores.forEach((color) => {
      const uniqueId = `${producto._id}_${color}`;

      const existente = nuevo.find((x) => x._uniqueId === uniqueId);

      if (existente) {
        existente.cantidad += cantidad;
      } else {
        nuevo.push({
          ...producto,
          cantidad,
          colores: [color],
          _uniqueId: uniqueId,
        });
      }
    });

    return nuevo;
  });
};

  const toggleColor = (id, color) => {
    setColoresSeleccionados(prev => {
      const actuales = prev[id] || [];
      if (actuales.includes(color)) {
        return { ...prev, [id]: actuales.filter(c => c !== color) };
      } else {
        return { ...prev, [id]: [...actuales, color] };
      }
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100">

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
                  src={p.imagen || "https://placehold.co/200"}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  alt={p.referencia}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.referencia}</h5>
                  <p className="card-text">
                    Categoría: {p.categoria} <br />
                    Marca: {p.marca || "N/A"} <br />
                    Código: {p.codigo || "N/A"}
                  </p>
                  {p.colores?.length > 0 && (
                  <div className="mb-2">
                    <strong>Colores:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {p.colores.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`btn btn-sm ${
                            coloresSeleccionados[p._id]?.includes(color)
                              ? "btn-danger"
                              : "btn-outline-danger"
                          }`}
                          onClick={() => toggleColor(p._id, color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                  <div className="mt-auto">
                    <div className="d-flex flex-column align-items-center mb-3">
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-outline-danger btn-sm me-2"
                          onClick={() =>
                            handleCantidadChange(
                              p._id,
                              Math.max(1, (cantidades[p._id] || 1) - 1)
                            )
                          }
                        >
                          −
                        </button>

                        <span
                          style={{
                            minWidth: "40px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {cantidades[p._id] || 1}
                        </span>

                        <button
                          className="btn btn-outline-danger btn-sm ms-2"
                          onClick={() =>
                            handleCantidadChange(p._id, (cantidades[p._id] || 1) + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button className="btn btn-danger w-100" onClick={() => addToCart(p)}>
                      Agregar al carrito
                    </button>
                    </div>
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