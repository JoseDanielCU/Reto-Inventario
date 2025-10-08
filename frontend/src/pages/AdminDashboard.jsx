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
  const [seccion, setSeccion] = useState("productos");
  const [editandoSucursal, setEditandoSucursal] = useState(null);

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
  useEffect(() => {
  if (seccion === "sucursales") {
    fetchSucursales();
  }
}, [seccion]);

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
 //Sucursales
    const [sucursales, setSucursales] = useState([]);
    const [sucursalForm, setSucursalForm] = useState({
      nombre: "",
      direccion: "",
      telefono: "",
      correo: "",
    });
    const [mensajeSucursal, setMensajeSucursal] = useState("");

    const fetchSucursales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sucursales", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setSucursales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      }
    };

    const handleSucursalChange = (e) => {
      setSucursalForm({ ...sucursalForm, [e.target.name]: e.target.value });
    };
    const handleSucursalEdit = (sucursal) => {
      setSucursalForm(sucursal);
      setEditandoSucursal(sucursal._id);
    };
    const handleSucursalSubmit = async (e) => {
      e.preventDefault();
      try {
        const url = editandoSucursal
          ? `http://localhost:5000/api/sucursales/${editandoSucursal}`
          : "http://localhost:5000/api/sucursales";

        const method = editandoSucursal ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(sucursalForm),
        });

        const data = await res.json();

        if (res.ok) {
          setMensajeSucursal(
            editandoSucursal
              ? "Sucursal actualizada correctamente"
              : "Sucursal creada correctamente"
          );
          setSucursalForm({ nombre: "", direccion: "", telefono: "", correo: "" });
          setEditandoSucursal(null);
          fetchSucursales();
        } else {
          setMensajeSucursal("Error: " + (data.msg || "No se pudo guardar"));
        }
      } catch (err) {
        setMensajeSucursal("Error de conexión con el servidor");
      }
    };

    const handleSucursalDelete = async (id) => {
      if (!window.confirm("¿Eliminar esta sucursal?")) return;
      try {
        const res = await fetch(`http://localhost:5000/api/sucursales/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          setMensajeSucursal("Sucursal eliminada");
          fetchSucursales();
        } else {
          setMensajeSucursal("Error al eliminar");
        }
      } catch (err) {
        setMensajeSucursal("Error de conexión");
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
            <a className="navbar-brand" href="#">Admin Dashboard</a>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link ${seccion === "usuarios" ? "active" : ""}`}
                    onClick={() => setSeccion("usuarios")}
                  >
                    Usuarios
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link ${seccion === "pedidos" ? "active" : ""}`}
                    onClick={() => setSeccion("pedidos")}
                  >
                    Pedidos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link ${seccion === "productos" ? "active" : ""}`}
                    onClick={() => setSeccion("productos")}
                  >
                    Productos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link ${seccion === "sucursales" ? "active" : ""}`}
                    onClick={() => setSeccion("sucursales")}
                  >
                    Sucursales
                  </button>
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
          {seccion === "productos" && (
    <>
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
      </>
  )} {seccion === "sucursales" && (
  <div>
    <h2 className="mb-4 text-danger">
      {editandoSucursal ? "Editar Sucursal" : "Crear Sucursal"}
    </h2>

    {/* Formulario de sucursal */}
    <form onSubmit={handleSucursalSubmit} className="mb-4">
      <div className="row">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            className="form-control"
            value={sucursalForm.nombre}
            onChange={handleSucursalChange}
            required
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            className="form-control"
            value={sucursalForm.direccion}
            onChange={handleSucursalChange}
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            className="form-control"
            value={sucursalForm.telefono}
            onChange={handleSucursalChange}
          />
        </div>
        <div className="col-md-6 mb-2">
          <input
            type="email"
            name="correo"
            placeholder="Correo de contacto"
            className="form-control"
            value={sucursalForm.correo}
            onChange={handleSucursalChange}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-danger mt-2">
        {editandoSucursal ? "Actualizar Sucursal" : "Crear Sucursal"}
      </button>

      {editandoSucursal && (
        <button
          type="button"
          className="btn btn-secondary mt-2 ms-2"
          onClick={() => {
            setEditandoSucursal(null);
            setSucursalForm({ nombre: "", direccion: "", telefono: "", correo: "" });
          }}
        >
          Cancelar
        </button>
      )}
    </form>

    {mensajeSucursal && (
      <div className="alert alert-info">{mensajeSucursal}</div>
    )}

    <h4>Listado de Sucursales</h4>
    <div className="row">
      {sucursales.length > 0 ? (
        sucursales.map((s) => (
          <div key={s._id} className="col-md-4 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{s.nombre}</h5>
                <p className="card-text">
                  {s.direccion || "Sin dirección"} <br />
                  {s.telefono && <>Tel: {s.telefono}</>} <br />
                  {s.correo && <>Correo: {s.correo}</>}
                </p>
                <button
                  onClick={() => handleSucursalEdit(s)}
                  className="btn btn-warning btn-sm me-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleSucursalDelete(s._id)}
                  className="btn btn-danger btn-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No hay sucursales registradas</p>
      )}
    </div>
  </div>
)}

</div>
      </div>
  );
}
