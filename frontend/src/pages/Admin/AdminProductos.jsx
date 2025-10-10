import { useState, useEffect } from "react";

export default function AdminProductos() {
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
  const [editando, setEditando] = useState(null);

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEdit = (producto) => {
    setFormData(producto);
    setEditando(producto._id);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    await fetch(`http://localhost:5000/api/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchProductos();
  };

  return (
    <div>
      {/*  Panel de productos */}
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
  );
}
