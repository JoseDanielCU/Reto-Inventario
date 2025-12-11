import { useState, useEffect } from "react";
import Papa from "papaparse";

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
    const [nuevoColor, setNuevoColor] = useState("");
    const [mostrarListaMarcas, setMostrarListaMarcas] = useState(false);
    const [csvProductos, setCsvProductos] = useState([]);


  const [formData, setFormData] = useState({
    referencia: "",
    categoria: "",
    nuevaCategoria: "",
    codigo: "",
    marca: "",
    descripcion: "",
    imagen: "",
    colores: [],
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
    const token = localStorage.getItem("token"); // o donde guardes el token

    const res = await fetch("http://localhost:5000/api/productos?all=true", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();

    const marcasUnicas = [...new Set(
      data
        .map((p) => p.marca)
        .filter(Boolean)
        .map((m) => m.trim())
    )];

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
  setFormData({
    referencia: producto.referencia || "",
    categoria: producto.categoria || "",
    nuevaCategoria: "",
    codigo: producto.codigo || "",
    marca: producto.marca || "",
    descripcion: producto.descripcion || "",
    imagen: producto.imagen || "",
    colores: producto.colores || [],
  });
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
      colores: [],   // <---
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
        // Categorías
        const listaCat = document.getElementById("lista-categorias");
        const inputCat = document.getElementById("input-categoria");

        if (listaCat && !listaCat.contains(e.target) && !inputCat.contains(e.target)) {
          setMostrarLista(false);
        }

        // Marcas
        const listaMarca = document.getElementById("lista-marcas");
        const inputMarca = document.getElementById("input-marca");

        if (listaMarca && !listaMarca.contains(e.target) && !inputMarca.contains(e.target)) {
          setMostrarListaMarcas(false);
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
const handleCSV = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  delimiter: ";", // <- importante
  complete: async (results) => {
    const rows = results.data;

    // Validación básica
    const requeridos = ["referencia", "categoria", "codigo"];
    for (let r of requeridos) {
      if (!Object.prototype.hasOwnProperty.call(rows[0], r)) {
        alert("El archivo CSV no contiene la columna obligatoria: " + r);
        return;
      }
    }

    // Limpieza de datos
    const productosLimpios = rows.map((p) => ({
      referencia: p.referencia?.trim() || "",
      categoria: p.categoria?.trim() || "",
      codigo: p.codigo?.trim() || "",
      marca: p.marca?.trim() || "",
      descripcion: p.descripcion?.trim() || "",
      imagen: p.imagen?.trim() || "",
      colores: p.colores
      ? p.colores.split(/[,;\t]/).map(c => c.trim()).filter(Boolean)
      : [],

    }));

      // Enviar al backend
        setCsvProductos(productosLimpios);
        alert("Archivo parseado correctamente. Ahora confirma la carga.");    },
  });
};

const subirProductosMasivos = async (lista) => {
  try {
    const res = await fetch("http://localhost:5000/api/productos/upload-csv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productos: lista }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error en carga masiva: " + (data.msg || "Error desconocido"));
      return;
    }

    alert("Carga masiva completada con éxito. " + data.insertados + " productos agregados.");
    fetchProductos();
  } catch (err) {
    console.error("Error en carga masiva:", err);
    alert("No se pudo cargar el archivo.");
  }
};
  return (

    <div>
      <h2 className="mb-4 text-danger">
        {editando ? "Editar Producto" : "Crear Producto"}
      </h2>
      <button
        className="btn btn-outline-danger mb-4"
        data-bs-toggle="modal"
        data-bs-target="#modalCargaMasiva"
         >
        Carga masiva CSV
      </button>


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

          <div className="col-md-4 mb-2 position-relative">
            <div className="input-group">
              <input
                id="input-marca"
                type="text"
                name="marca"
                className="form-control"
                placeholder="Escribe o selecciona una marca"
                value={formData.marca}
                autoComplete="off"
                onFocus={() => setMostrarListaMarcas(true)}
                onChange={(e) => {
                  setFormData({ ...formData, marca: e.target.value });
                  setMostrarListaMarcas(true);
                }}
              />

              {/* BOTÓN LIMPIAR */}
              {formData.marca && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFormData({ ...formData, marca: "" })}
                >
                  ✕
                </button>
              )}
            </div>

            {/* LISTA DE SUGERENCIAS */}
            {mostrarListaMarcas && marcas.length > 0 && (
              <ul
                id="lista-marcas"
                className="list-group position-absolute w-100 fade show"
                style={{
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto",
                  transition: "opacity 0.15s ease-in-out"
                }}
              >
                {/* MARCAS FILTRADAS */}
                {marcas
                  .filter((m) =>
                    m.toLowerCase().includes(formData.marca.toLowerCase())
                  )
                  .map((m, i) => (
                    <li
                      key={i}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setFormData({ ...formData, marca: m });
                        setMostrarListaMarcas(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {m}
                    </li>
                  ))}

                {/* CREAR NUEVA MARCA */}
                {marcas.filter((m) =>
                  m.toLowerCase().includes(formData.marca.toLowerCase())
                ).length === 0 &&
                  formData.marca.trim() !== "" && (
                    <li
                      className="list-group-item list-group-item-action text-success fw-bold"
                      onClick={() => {
                        setFormData({ ...formData, marca: formData.marca });
                        setMostrarListaMarcas(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Crear nueva marca: "{formData.marca}"
                    </li>
                  )}
              </ul>
            )}
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
        {/* COLORES */}
        <div className="col-12 mb-3">
          <label className="form-label fw-bold">Colores</label>

          <div className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Escribe un color y agrégalo"
              value={nuevoColor}
              onChange={(e) => setNuevoColor(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                if (nuevoColor.trim() !== "" && !formData.colores.includes(nuevoColor.trim())) {
                  setFormData({
                    ...formData,
                    colores: [...formData.colores, nuevoColor.trim()],
                  });
                  setNuevoColor("");
                }
              }}
            >
              Añadir
            </button>
          </div>

          {/* Lista de colores */}
          <div className="mt-2">
            {formData.colores.length === 0 && (
              <p className="text-muted">No hay colores agregados.</p>
            )}

            {formData.colores.map((c, i) => (
              <span key={i} className="badge bg-secondary me-2">
                {c}
                <button
                  type="button"
                  className="btn-close btn-close-white ms-2"
                  style={{ transform: "scale(0.8)" }}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      colores: formData.colores.filter((_, idx) => idx !== i),
                    })
                  }
                ></button>
              </span>
            ))}
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
                colores: [],
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
          <div key={p._id} className="col-md-3 mb-3">
              <div className="card h-100 d-flex flex-column shadow-sm">

              <img
                src={p.imagen || "https://placehold.co/200"}
                className="card-img-top"
                style={{ height: "200px", objectFit: "cover" }}
                alt={p.referencia}
              />

              <div className="card-body">
                <h5 className="card-title">{p.referencia}</h5>
                <p className="card-text">{p.descripcion}</p>
               <p className="card-text">
                Categoría: {p.categoria} <br />
                Marca: {p.marca || "N/A"} <br />
                Código: {p.codigo || "N/A"}
              </p>

              {p.colores && p.colores.length > 0 && (
                <div className="card-text">
                  Colores:
                  {p.colores.map((c, i) => (
                    <span key={i} className="badge bg-secondary ms-2">{c}</span>
                  ))}
                </div>
              )}

                <div className="d-flex flex-wrap gap-2 mt-2 w-100">

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
        <div className="modal fade" id="modalCargaMasiva" tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">

      <div className="modal-header">
        <h5 className="modal-title">Carga Masiva de Productos (CSV)</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body">
        <p className="text-muted">
          El archivo CSV debe contener columnas:
          <strong>referencia, categoria, codigo, marca, descripcion, imagen, colores</strong>
          (colores separados por comas).
        </p>

        <input
          type="file"
          accept=".csv"
          className="form-control"
          onChange={(e) => handleCSV(e)}
        />
      </div>

      <div className="modal-footer">
        <button
          className="btn btn-danger"
          disabled={csvProductos.length === 0}
          onClick={() => subirProductosMasivos(csvProductos)}
        >
          Enviar
        </button>

        <button className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>

    </div>
  </div>
</div>

      </div>
    </div>

  );
}
