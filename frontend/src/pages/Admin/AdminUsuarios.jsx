import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [csvUsuarios, setCsvUsuarios] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
  nombre: "",
      apellidos: "",
  correo: "",
  password: "",
  rol: "user",
  sucursal_id: "",
  activo: true,
});


  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchSucursales();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEdit = (u) => {
    setEditando(u._id);
    setFormData({
      nombre: u.nombre,
        apellidos: u.apellidos,
      correo: u.correo,
      password: "",
      rol: u.rol,
        sucursal:u.sucursal,
      activo: u.activo,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editando
      ? `http://localhost:5000/api/usuarios/${editando}`
      : "http://localhost:5000/api/usuarios";

    const method = editando ? "PUT" : "POST";

    const payload = { ...formData };
    if (editando && !payload.password) delete payload.password;

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
      setMensaje(editando ? "Usuario actualizado" : "Usuario creado");
      setEditando(null);
      setFormData({
        nombre: "",
          apellidos: "",
        correo: "",
        password: "",
        rol: "user",
          sucursal:"",
        activo: true,
      });
      fetchUsuarios();
    } else {
      setMensaje(data.msg || "Error al guardar usuario");
    }
  };

  const toggleActivo = async (id, estado) => {
    await fetch(`http://localhost:5000/api/usuarios/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ activo: !estado }),
    });
    fetchUsuarios();
  };
    const fetchSucursales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sucursales", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setSucursales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar sucursales", err);
      }
    };
    const handleCSVUsuarios = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
        complete: (results) => {
          const usuarios = results.data.map(u => ({
            nombre: u.nombre?.trim(),
            apellidos: u.apellidos?.trim(),
            correo: u.correo?.trim(),
            password: u.password?.trim(),
            rol: u.rol || "user",
            sucursal_id: u.sucursal_id || "",
            activo: u.activo !== "false"
          }));

          setCsvUsuarios(usuarios);
          alert("CSV de usuarios cargado correctamente");
        }
      });
    };
    const subirUsuariosMasivos = async () => {
      const res = await fetch("http://localhost:5000/api/usuarios/upload-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ usuarios: csvUsuarios }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error en carga masiva");
        return;
      }

      alert(
  `Usuarios cargados
Insertados: ${data.insertados}
Actualizados: ${data.actualizados}
Errores: ${data.errores.length}`
);

if (data.errores?.length) {
  console.log("Errores CSV:", data.errores);
}

    };

  return (
    <div>
      <div className="card p-3 mb-4 shadow-sm">
        <h2 className="text-danger mb-3">
          {editando ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              name="nombre"
              className="form-control"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
            <div className="col-md-4">
            <input
              type="text"
              name="Apellidos"
              className="form-control"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}

            />
          </div>

          <div className="col-md-4">
            <input
              type="email"
              name="correo"
              className="form-control"
              placeholder="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
            <div className="col-md-4">
              <select
                name="sucursal_id"
                className="form-select"
                value={formData.sucursal_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

          <div className="col-md-4">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder={editando ? "Nueva contraseña (opcional)" : "Contraseña"}
              value={formData.password}
              onChange={handleChange}
              required={!editando}
            />
          </div>

          <div className="col-md-3">
            <select
              name="rol"
              className="form-select"
              value={formData.rol}
              onChange={handleChange}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <label className="form-check-label">Activo</label>
            </div>
          </div>

          <div className="col-12">
            <button className="btn btn-danger">
              {editando ? "Actualizar" : "Crear"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => {
                  setEditando(null);
                  setFormData({
                    nombre: "",
                      apellidos: "",
                    correo: "",
                    password: "",
                    rol: "user",
                        sucursal_nombre:"",
                    activo: true,
                  });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Usuarios existentes</h4>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger"
              data-bs-toggle="modal"
              data-bs-target="#modalCargaUsuarios"
            >
              Carga masiva CSV
            </button>
          </div>
        </div>

      <div className="row">
        {usuarios.map((u) => (
          <div key={u._id} className="col-md-3 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{u.nombre}</h5>
                <p className="card-text">
                  Correo: {u.correo} <br />
                    Sucursal: {u.sucursal_nombre} <br />
                  Rol: {u.rol}
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(u)}
                  >
                    Editar
                  </button>

                  <button
                    className={`btn btn-sm ${u.activo ? "btn-success" : "btn-secondary"}`}
                    onClick={() => toggleActivo(u._id, u.activo)}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        <div className="modal fade" id="modalCargaUsuarios" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Carga masiva de usuarios</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body">

                  <div className="alert alert-warning">
                    <strong>Carga Masiva de Usuarios (CSV)</strong>
                    <p className="mb-1 mt-2">
                      El archivo CSV debe contener las siguientes columnas:
                    </p>
                    <code>
                      nombre;apellidos;correo;password;rol;sucursal_id;activo
                    </code>

                    <ul className="mt-2 mb-0">
                      <li><strong>rol:</strong> user | admin</li>
                      <li><strong>sucursal_id:</strong> ID válido de sucursal</li>
                      <li><strong>activo:</strong> true | false</li>
                      <li><strong>Separador:</strong> ;</li>
                    </ul>
                  </div>

                  <input
                    type="file"
                    accept=".csv"
                    className="form-control"
                    onChange={handleCSVUsuarios}
                  />

                  {csvUsuarios.length > 0 && (
                    <p className="text-muted mt-2">
                      Usuarios cargados: {csvUsuarios.length}
                    </p>
                  )}
                </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-danger"
                  disabled={csvUsuarios.length === 0}
                  onClick={subirUsuariosMasivos}
                >
                  Enviar CSV
                </button>
              </div>

            </div>
          </div>
        </div>

    </div>
  );
}
