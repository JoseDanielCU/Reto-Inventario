import { useState, useEffect } from "react";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);
    const [search, setSearch] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroCodigo, setFiltroCodigo] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [marcas, setMarcas] = useState([]);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [formData, setFormData] = useState({
    referencia: "",
    categoria: "",
    nuevaCategoria: "",
    codigo: "",
    marca: "",
    descripcion: "",
    imagen: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null);

  const fetchProductos = async () => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filtroCategoria) params.append("categoria", filtroCategoria);
    if (filtroCodigo) params.append("codigo", filtroCodigo);
    if (filtroMarca) params.append("marca", filtroMarca);
    if (mostrarInactivos) params.append("activo", "false");

    const res = await fetch(
      `http://localhost:5000/api/productos?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    const data = await res.json();
    setProductos(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
};
const fetchMarcas = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/productos");
    const data = await res.json();

    if (!Array.isArray(data)) return;

    const marcasUnicas = [...new Set(data.map((p) => p.marca).filter(Boolean))];
    setMarcas(marcasUnicas);
  } catch (err) {
    console.error("Error al cargar marcas:", err);
  }
};

  const fetchCategorias = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categorias");
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchMarcas();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = (producto) => {
    setFormData({ ...producto, nuevaCategoria: "" });
    setEditando(producto._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoriaFinal =
      formData.nuevaCategoria !== "" ? formData.nuevaCategoria : formData.categoria;

    const payload = { ...formData, categoria: categoriaFinal };
    delete payload.nuevaCategoria;

    const url = editando
      ? `http://localhost:5000/api/productos/${editando}`
      : "http://localhost:5000/api/productos";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setMensaje(editando ? "Producto actualizado" : "Producto creado");
      setFormData({
        referencia: "",
        categoria: "",
        nuevaCategoria: "",
        codigo: "",
        marca: "",
        descripcion: "",
        imagen: "",
      });
      setEditando(null);

      fetchProductos();
      fetchCategorias();
    } else {
      setMensaje("Error: " + (data.msg || "No se pudo guardar"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    await fetch(`http://localhost:5000/api/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchProductos();
  };
    useEffect(() => {
      function handleClickOutside(e) {
        const lista = document.getElementById("lista-categorias");
        const input = document.getElementById("input-categoria");

        if (lista && !lista.contains(e.target) && !input.contains(e.target)) {
          setMostrarLista(false);
        }
      }

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);
  const toggleActivo = async (id, estadoActual) => {
    try {
      const res = await fetch(`http://localhost:5000/api/productos/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ activo: !estadoActual }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error al actualizar estado: " + data.msg);
        return;
      }

      fetchProductos(); // recargar lista
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  return (

    <div>
      <h2 className="mb-4 text-danger">
        {editando ? "Editar Producto" : "Crear Producto"}
      </h2>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              name="referencia"
              placeholder="Referencia"
              className="form-control"
              value={formData.referencia}
              onChange={handleChange}
              required
            />
          </div>

          {/* SELECT DE CATEGORÍAS */}
            {/* INPUT AUTOCOMPLETE DE CATEGORÍAS */}
        <div className="col-md-4 mb-2 position-relative">
          <div className="input-group">
              <input
                id="input-categoria"
                type="text"
                name="categoria"
                className="form-control"
                placeholder="Escribe o selecciona una categoría"
                value={formData.categoria}
                autoComplete="off"
                onFocus={() => setMostrarLista(true)}
                onChange={(e) => {
                  setFormData({ ...formData, categoria: e.target.value });
                  setMostrarLista(true);
                }}
              />

              {/* BOTÓN LIMPIAR */}
              {formData.categoria && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFormData({ ...formData, categoria: "" })}
                >
                  ✕
                </button>
              )}
            </div>


          {/* LISTA DE SUGERENCIAS */}
          {mostrarLista && categorias.length > 0 && (
              <ul
                id="lista-categorias"
                className="list-group position-absolute w-100 fade show"
                style={{
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto",
                  transition: "opacity 0.15s ease-in-out"
                }}
              >



              {/* CATEGORÍAS FILTRADAS */}
              {categorias
                .filter(c =>
                  c.toLowerCase().includes(formData.categoria.toLowerCase())
                )
                .map((c, i) => (
                  <li
                      key={i}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setFormData({ ...formData, categoria: c });
                        setMostrarLista(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {c}
                </li>

                ))}

              {/* OPCIÓN PARA CREAR NUEVA CATEGORÍA */}
              {categorias.filter(c =>
                c.toLowerCase().includes(formData.categoria.toLowerCase())
              ).length === 0 && formData.categoria.trim() !== "" && (
                <li
                  className="list-group-item list-group-item-action text-success fw-bold"
                  onClick={() => {
                    setFormData({ ...formData, categoria: formData.categoria });
                    setMostrarLista(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Crear nueva categoría: "{formData.categoria}"
                </li>

              )}

            </ul>
          )}
        </div>



          <div className="col-md-4 mb-2">
            <input
              type="text"
              name="codigo"
              placeholder="Código"
              className="form-control"
              value={formData.codigo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-2">
            <input
              type="text"
              name="marca"
              placeholder="Marca"
              className="form-control"
              value={formData.marca}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-2">
            <input
              type="text"
              name="imagen"
              placeholder="URL imagen"
              className="form-control"
              value={formData.imagen}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 mb-2">
            <textarea
              name="descripcion"
              placeholder="Descripción"
              className="form-control"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-danger mt-2">
          {editando ? "Actualizar" : "Crear Producto"}
        </button>

        {editando && (
          <button
            type="button"
            className="btn btn-secondary ms-2 mt-2"
            onClick={() => {
              setFormData({
                referencia: "",
                categoria: "",
                nuevaCategoria: "",
                codigo: "",
                marca: "",
                descripcion: "",
                imagen: "",
              });
              setEditando(null);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}
        <h4 className="mb-3">Buscar Productos</h4>

        <form className="row mb-4 g-2" onSubmit={(e) => {
          e.preventDefault();
          fetchProductos();
        }}>
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
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Código"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
<div className="col-12 col-md-2 d-flex align-items-center">
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      id="mostrarInactivos"
      checked={mostrarInactivos}
      onChange={(e) => setMostrarInactivos(e.target.checked)}
    />
    <label className="form-check-label" htmlFor="mostrarInactivos">
      Mostrar inactivos
    </label>
  </div>
</div>

          <div className="col-6 col-md-2">
            <button type="submit" className="btn btn-danger w-100">
              Filtrar
            </button>
          </div>
        </form>

      {/* LISTADO DE PRODUCTOS */}
      <h4>Productos Existentes</h4>
      <div className="row">
        {productos.map((p) => (
          <div key={p._id} className="col-md-4 mb-3">
            <div className="card shadow-sm">
              {p.imagen && (
                <img
                  src={p.imagen || "https://placehold.co/200"}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                  alt={p.referencia}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{p.referencia}</h5>
                <p className="card-text">{p.descripcion}</p>
                <p className="card-text">
                    Categoría: {p.categoria} <br />
                    Marca: {p.marca || "N/A"} <br />
                    Código: {p.codigo || "N/A"}
                  </p>
                <div className="d-flex gap-2 mt-2">

                {/* EDITAR */}
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleEdit(p)}
                >
                  <i className="bi bi-pencil-square"></i> Editar
                </button>

                {/* ELIMINAR */}
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(p._id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </button>

                {/* ACTIVO / INACTIVO */}
                <button
                  className={`btn btn-sm ${p.activo ? "btn-success" : "btn-secondary"}`}
                  onClick={() => toggleActivo(p._id, p.activo)}
                >
                  <i className={`bi ${p.activo ? "bi-check-circle" : "bi-x-circle"}`}></i>
                  {" "}
                  {p.activo ? "Activo" : "Inactivo"}
                </button>

              </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
