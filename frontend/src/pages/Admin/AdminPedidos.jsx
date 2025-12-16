import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pedidoEditado, setPedidoEditado] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [pedidoCancelado, setPedidoCancelado] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ApproveReason, setApproveReason] = useState("");
  const [pedidoAprobado, setPedidoAprobado] = useState(null);
  const [SendReason, setSendReason] = useState("");
  const [pedidoEnviado, setPedidoEnviado] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos`, {
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
    setPedidos(prev =>
      prev.map(p =>
        p._id === pedidoId
          ? {
              ...p,
              productos: p.productos.map((prod, i) =>
                i === idx
                  ? { ...prod, cantidad_modificada: nuevaCantidad }
                  : prod
              )
            }
          : p
      )
    );
  };

  const guardarAprobacion = async (pedido) => {
    const res = await fetch(`${API_URL}/api/pedidos/${pedidoAprobado}/aprobar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        productos: pedido.productos,
        motivo: ApproveReason,
      }),
    });

    if (res.ok) {
      setMensaje("Pedido aprobado y actualizado");
      setPedidoAprobado(null);
      setApproveReason("");
      fetchPedidos();
    } else {
      setMensaje("Error al aprobar pedido");
    }
  };

  const marcarEnviado = async () => {
    const res = await fetch(`${API_URL}/api/pedidos/${pedidoEnviado}/enviar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      motivo: SendReason
    }),
  });



    if (res.ok) {
      setMensaje("Pedido marcado como enviado");
      setPedidoEnviado(null)
      setSendReason("");
      fetchPedidos();
    } else {
      setMensaje("Error al marcar como enviado");
    }
  };

  const cancelarPedido = async () => {
    const res = await fetch(`${API_URL}/api/pedidos/${pedidoCancelado}/cancelar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ motivo: cancelReason }),
    });

    if (res.ok) {
      setMensaje("Pedido cancelado correctamente");
      setPedidoCancelado(null);
      setCancelReason("");
      fetchPedidos();
    } else {
      setMensaje("Error al cancelar pedido");
    }
  };
    const guardarCantidades = async (pedido) => {
      const res = await fetch(`${API_URL}/api/pedidos/${pedido._id}/actualizar-cantidades`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productos: pedido.productos }),
      });

      if (res.ok) {
        setMensaje("Cantidades actualizadas correctamente");
        setPedidoEditado(null);
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
      <div className="card p-3 mb-4 shadow-sm">
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
                  Pedido #{index + 1} - {pedido.estado.toUpperCase()} - Sucursal: {pedido.sucursal_nombre}
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
                        <th>Referencia</th>
                        <th>Color</th>
                        <th>Categoría</th>
                        <th>Código</th>
                        <th>Marca</th>
                        <th>Cantidad</th>
                        <th>Cantidad a Enviar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos.map((p, i) => (
                        <tr key={i}>
                          <td>{p.referencia}</td>
                          <td>{p.colores}</td>
                          <td>{p.categoria}</td>
                          <td>{p.codigo}</td>
                          <td>{p.marca}</td>

                          {/* Cantidad pedida original */}
                          <td>{p.cantidad}</td>

                          {/* Cantidad modificada */}
                          <td>
                            {pedidoEditado === pedido._id ? (
                              <input
                                type="number"
                                className="form-control"
                                value={p.cantidad_modificada}
                                min="1"
                                onChange={(e) =>
                                  modificarCantidad(pedido._id, i, Number(e.target.value))
                                }
                                style={{ width: "80px" }}
                              />
                            ) : (
                              p.cantidad_modificada
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pedido.estado === "pendiente" && (
                      <div className="mt-3">
                        {pedidoEditado === pedido._id ? (
                          <>
                           <button
                              className="btn btn-primary me-2"
                              onClick={() => guardarCantidades(pedido)}
                            >
                              Guardar cambios de cantidad
                            </button>

                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setPedidoEditado(null)}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-warning me-2"
                            onClick={() => setPedidoEditado(pedido._id)}
                          >
                            Modificar cantidades
                          </button>
                        )}

                        <button
                          className="btn btn-success"
                          onClick={() => setPedidoAprobado(pedido._id)}
                        >
                          Aprobar pedido
                        </button>
                      </div>
                    )}
                  {pedido.estado === "aprobado" && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => setPedidoEnviado(pedido._id)}
                    >
                      Marcar como enviado
                    </button>
                  )}

                  {pedido.estado !== "cancelado" && (
                    <button
                      className="btn btn-danger mt-3 ms-3"
                      onClick={() => setPedidoCancelado(pedido._id)}
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
      {pedidoCancelado && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancelar Pedido</h5>
                <button className="btn-close" onClick={() => setPedidoCancelado(null)}></button>
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
                <button className="btn btn-secondary" onClick={() => setPedidoCancelado(null)}>
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

      {/* MODAL DE APROBACIÓN */}
        {pedidoAprobado && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Motivo de aprobación del pedido</h5>
                            <button className="btn-close" onClick={() => setApproveReason("")}></button>
                        </div>
                        <div className="modal-body">
                            <label>Por favor, ingrese el motivo de la aprobación:</label>
                            <textarea
                                className="form-control"
                                value={ApproveReason}
                                onChange={(e) => setApproveReason(e.target.value)}
                            />
                        </div>
                      <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setPedidoAprobado(null)}>
                            Cerrar
                          </button>
                          <button className="btn btn-danger" onClick={guardarAprobacion}>
                            Aprobar Pedido
                          </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* MODAL DE ENVÍO */}
        {pedidoEnviado && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Motivo de envío del pedido</h5>
                            <button className="btn-close" onClick={() => setSendReason("")}></button>
                        </div>
                        <div className="modal-body">
                            <label>Por favor, ingrese el motivo del envío:</label>
                            <textarea
                                className="form-control"
                                value={SendReason}
                                onChange={(e) => setSendReason(e.target.value)}
                            />
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" onClick={() => setPedidoEnviado(null)}>
                            Cerrar
                          </button>
                          <button className="btn btn-danger" onClick={marcarEnviado}>
                            Aprobar Pedido
                          </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
