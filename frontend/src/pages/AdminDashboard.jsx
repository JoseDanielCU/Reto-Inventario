import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    modelo: "",
    categoria: "",
    codigo: "",
    marca: "",
    descripcion: "",
    imagen: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null); // guardar ID si se edita
  const navigate = useNavigate();

  // Obtener productos
  const fetchProductos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/productos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Manejo inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear o editar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(editando ? "Producto actualizado" : "Producto creado");
        setFormData({
          nombre: "",
          modelo: "",
          categoria: "",
          codigo: "",
          marca: "",
          descripcion: "",
          imagen: "",
        });
        setEditando(null);
        fetchProductos();
      } else {
        setMensaje("Error: " + (data.msg || "No se pudo guardar"));
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor");
    }
  };

  // Editar producto (llenar formulario con valores)
  const handleEdit = (producto) => {
    setFormData(producto);
    setEditando(producto._id);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        setMensaje("Producto eliminado");
        fetchProductos();
      } else {
        setMensaje("Error al eliminar producto");
      }
    } catch (err) {
      setMensaje("Error de conexión");
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Admin Dashboard
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
                <a className="nav-link" href="#">
                  Usuarios
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Pedidos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Productos
                </a>
              </li>
            </ul>
            <button onClick={handleLogout} className="btn btn-light">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/*  Panel de productos */}
      <div className="container mt-4">
        <h2 className="mb-4 text-danger">
          {editando ? "Editar Producto" : "Crear Producto"}
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-6 mb-2">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <input
                type="text"
                name="modelo"
                placeholder="Modelo"
                className="form-control"
                value={formData.modelo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-2">
              <input
                type="text"
                name="categoria"
                placeholder="Categoría"
                className="form-control"
                value={formData.categoria}
                onChange={handleChange}
                required
              />
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
                placeholder="URL de Imagen"
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
              className="btn btn-secondary mt-2 ms-2"
              onClick={() => {
                setFormData({
                  nombre: "",
                  modelo: "",
                  categoria: "",
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

        <h4>Productos Existentes</h4>
        <div className="row">
          {productos.length > 0 ? (
            productos.map((p) => (
              <div key={p._id} className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  {p.imagen && (
                    <img
                      src={p.imagen}
                      className="card-img-top"
                      alt={p.nombre}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{p.nombre}</h5>
                    <p className="card-text">
                      {p.descripcion || "Sin descripción"}
                    </p>
                    <button
                      onClick={() => handleEdit(p)}
                      className="btn btn-warning btn-sm me-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay productos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}
