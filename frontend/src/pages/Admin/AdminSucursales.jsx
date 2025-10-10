import {useEffect, useState} from "react";

export default function AdminSucursales() {
//Sucursales
    const [sucursales, setSucursales] = useState([]);
    const [sucursalForm, setSucursalForm] = useState({
      nombre: "",
      direccion: "",
      telefono: "",
      correo: "",
    });
    const [mensajeSucursal, setMensajeSucursal] = useState("");
    const [editandoSucursal, setEditandoSucursal] = useState(null);

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
  useEffect(() => {
    fetchSucursales();
  }, []);
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




  return (
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

  );
}
