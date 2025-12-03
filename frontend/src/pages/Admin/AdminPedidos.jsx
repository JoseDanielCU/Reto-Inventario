import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [pedidoCancelando, setPedidoCancelando] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const fetchPedidos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pedidos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPedidos(data);
    } catch {
      setMensaje("Error al cargar pedidos");
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const modificarCantidad = (pedidoId, idx, nuevaCantidad) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p._id === pedidoId
          ? {
              ...p,
              productos: p.productos.map((prod, i) =>
                i === idx ? { ...prod, cantidad: nuevaCantidad } : prod
              ),
            }
          : p
      )
    );
  };

  const guardarAprobacion = async (pedido) => {
    const res = await fetch(`http://localhost:5000/api/pedidos/${pedido._id}/aprobar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productos: pedido.productos }),
    });

    if (res.ok) {
      setMensaje("Pedido aprobado y actualizado");
      setPedidoEditando(null);
      fetchPedidos();
    } else {
      setMensaje("Error al aprobar pedido");
    }
  };

  const marcarEnviado = async (id) => {
    const res = await fetch(`http://localhost:5000/api/pedidos/${id}/enviar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) {
      setMensaje("Pedido marcado como enviado");
      fetchPedidos();
    } else {
      setMensaje("Error al marcar como enviado");
    }
  };

  const cancelarPedido = async () => {
    const res = await fetch(`http://localhost:5000/api/pedidos/${pedidoCancelando}/cancelar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ motivo: cancelReason }),
    });

    if (res.ok) {
      setMensaje("Pedido cancelado correctamente");
      setPedidoCancelando(null);
      setCancelReason("");
      fetchPedidos();
    } else {
      setMensaje("Error al cancelar pedido");
    }
  };
    const guardarCantidades = async (pedido) => {
      const res = await fetch(`http://localhost:5000/api/pedidos/${pedido._id}/actualizar-cantidades`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productos: pedido.productos }),
      });

      if (res.ok) {
        setMensaje("Cantidades actualizadas correctamente");
        setPedidoEditando(null);
        fetchPedidos();
      } else {
        setMensaje("Error al actualizar cantidades");
      }
    };
    const pedidosFiltrados = pedidos.filter((pedido) => {
      const matchText =
        searchText === "" ||
        pedido._id.toLowerCase().includes(searchText.toLowerCase()) ||
        pedido.asesor_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        pedido.sucursal_nombre?.toLowerCase().includes(searchText.toLowerCase());

      const matchEstado =
        filterEstado === "" || pedido.estado === filterEstado;

      const fechaPedido = pedido.fecha_creacion
          ? new Date(pedido.fecha_creacion)
          : null;

        let matchFecha = true;

        if (fechaInicio) {
          matchFecha = fechaPedido >= new Date(fechaInicio);
        }

        if (fechaFin) {
          matchFecha = matchFecha && fechaPedido <= new Date(fechaFin + "T23:59:59");
        }


      return matchText && matchEstado && matchFecha;
    });

  return (
    <div className="container mt-4">
      <h2 className="text-danger mb-4">Pedidos Registrados</h2>
        <div className="row mb-3">
      {/* BUSCADOR */}
      <div className="col-md-4 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por ID, asesor, sucursal…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* ESTADO */}
      <div className="col-md-3 mb-2">
        <select
          className="form-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="">Filtrar por estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="enviado">Enviado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* BOTÓN LIMPIAR */}
      <div className="col-md-2 mb-2">
        <button
          className="btn btn-secondary w-100"
          onClick={() => {
            setSearchText("");
            setFilterEstado("");
            setFechaInicio("");
            setFechaFin("");
          }}
        >
          Limpiar
        </button>
      </div>
    </div>

    {/* FILTRO DE FECHAS */}
    <div className="row mb-3">

      <div className="col-md-3">
        <label className="form-label">Desde</label>
        <input
          type="date"
          className="form-control"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </div>

  <div className="col-md-3">
    <label className="form-label">Hasta</label>
    <input
      type="date"
      className="form-control"
      value={fechaFin}
      onChange={(e) => setFechaFin(e.target.value)}
    />
  </div>

</div>


      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      {pedidos.length === 0 ? (
        <p>No hay pedidos registrados</p>
      ) : (
        <div className="accordion" id="accordionPedidos">
          {pedidosFiltrados.map((pedido, index) => (
            <div className="accordion-item" key={pedido._id}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                >
                  Pedido #{index + 1} - {pedido.estado.toUpperCase()}
                </button>
              </h2>

              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse"
              >
                <div className="accordion-body">

                  <p><strong>Asesor:</strong> {pedido.asesor_id}</p>
                  <p><strong>Sucursal:</strong> {pedido.sucursal_nombre}</p>
                    <p>
                      <strong>Fecha de creación:</strong>{" "}
                      {new Date(pedido.fecha_creacion).toLocaleString("es-CO")}
                    </p>

                  <h5 className="mt-3">Productos:</h5>

                  <table className="table table-striped table-bordered mt-2">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Modelo</th>
                        <th>Categoría</th>
                        <th>Código</th>
                        <th>Marca</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos.map((p, i) => (
                        <tr key={i}>
                          <td>{p.nombre}</td>
                          <td>{p.modelo}</td>
                          <td>{p.categoria}</td>
                          <td>{p.codigo}</td>
                          <td>{p.marca}</td>
                          <td>
                            {pedidoEditando === pedido._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={p.cantidad}
                                min="1"
                                onChange={(e) =>
                                  modificarCantidad(pedido._id, i, Number(e.target.value))
                                }
                                style={{ width: "80px" }}
                              />
                            ) : (
                              p.cantidad
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pedido.estado === "pendiente" && (
                      <div className="mt-3">
                        {pedidoEditando === pedido._id ? (
                          <>
                            <button
                              className="btn btn-primary me-2"
                              onClick={() => guardarCantidades(pedido)}
                            >
                              Guardar cambios de cantidad
                            </button>

                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setPedidoEditando(null)}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-warning me-2"
                            onClick={() => setPedidoEditando(pedido._id)}
                          >
                            Modificar cantidades
                          </button>
                        )}

                        <button
                          className="btn btn-success"
                          onClick={() => guardarAprobacion(pedido)}
                        >
                          Aprobar pedido
                        </button>
                      </div>
                    )}
                  {pedido.estado === "aprobado" && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => marcarEnviado(pedido._id)}
                    >
                      Marcar como enviado
                    </button>
                  )}

                  {pedido.estado !== "cancelado" && (
                    <button
                      className="btn btn-danger mt-3 ms-3"
                      onClick={() => setPedidoCancelando(pedido._id)}
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CANCELACIÓN */}
      {pedidoCancelando && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancelar Pedido</h5>
                <button className="btn-close" onClick={() => setPedidoCancelando(null)}></button>
              </div>
              <div className="modal-body">
                <label>Motivo de cancelación:</label>
                <textarea
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setPedidoCancelando(null)}>
                  Cerrar
                </button>
                <button className="btn btn-danger" onClick={cancelarPedido}>
                  Cancelar pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
