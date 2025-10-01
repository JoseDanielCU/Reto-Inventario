import { useState, useEffect } from "react";

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

  // 🔹 Obtener lista de productos existentes
  const fetchProductos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lista_productos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 🔹 Manejo de inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Crear producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/crear_productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMensaje("Producto creado con éxito");
        setFormData({
          nombre: "",
          modelo: "",
          categoria: "",
          codigo: "",
          marca: "",
          descripcion: "",
          imagen: "",
        });
        fetchProductos(); // actualizar lista
      } else {
        setMensaje("Error: " + data.msg);
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4" style={{ color: "#E60000" }}>
        Panel de Administrativo
      </h2>
      <h4>Crear Producto</h4>
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
          <div className="col-md-6 mb-2">
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
        <button
          type="submit"
          className="btn mt-2"
          style={{ backgroundColor: "#E60000", color: "white" }}
        >
          Crear Producto
        </button>
      </form>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <h4>Productos Existentes</h4>
      <div className="row">
        {productos.map((p) => (
          <div key={p._id} className="col-md-4 mb-3">
            <div className="card">
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
