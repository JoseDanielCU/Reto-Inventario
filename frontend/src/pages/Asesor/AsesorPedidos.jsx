import { useEffect, useState } from "react";

export default function PedidosAsesor() {
    const [pedidos, setPedidos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [search, setSearch] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const sucursalId = user?.sucursal_id;

    useEffect(() => {
        if (!token || !sucursalId) {
            setMensaje("No se encontró autenticación o sucursal.");
            return;
        }

        fetch(`http://localhost:5000/api/pedidos/sucursal/${sucursalId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setPedidos(data);
                } else {
                    setMensaje("Error obteniendo pedidos.");
                }
            })
            .catch(() => {
                setMensaje("No se pudo conectar con el servidor.");
            });
    }, [token, sucursalId]);
    const pedidosFiltrados = pedidos.filter((p) => {
        const texto = search.toLowerCase();

        // Filtro por texto
        const coincideTexto =
            p._id?.toLowerCase().includes(texto) ||
            p.estado?.toLowerCase().includes(texto) ||
            p.productos?.some((prod) =>
                prod.referencia.toLowerCase().includes(texto)
            );

        // Filtro por estado
        const coincideEstado =
            estadoFiltro === "" || p.estado === estadoFiltro;

        // Fechas
        const fechaPedido = new Date(p.fecha_creacion);
        const desde = fechaInicio ? new Date(fechaInicio) : null;
        const hasta = fechaFin ? new Date(fechaFin) : null;

        const coincideFecha =
            (!desde || fechaPedido >= desde) &&
            (!hasta || fechaPedido <= hasta);

        return coincideTexto && coincideEstado && coincideFecha;
    });

    return (
        <div className="container mt-4">
            <h2 className="text-danger mb-4">Pedidos de mi Sucursal</h2>
                {/* FILTROS */}
                <div className="card p-3 mb-4 shadow-sm">

                    <div className="row g-3">

                        {/* BUSCADOR */}
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por ID, estado o producto…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* ESTADO */}
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="enviado">Enviado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        {/* LIMPIAR */}
                        <div className="col-md-2">
                            <button
                                className="btn btn-secondary w-100"
                                onClick={() => {
                                    setSearch("");
                                    setEstadoFiltro("");
                                    setFechaInicio("");
                                    setFechaFin("");
                                }}
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* FILTRO DE FECHAS */}
                    <div className="row g-3 mt-1">
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
                <p>No hay pedidos registrados en esta sucursal.</p>
            ) : (
                <div className="accordion" id="accordionAsesor">
                    {pedidosFiltrados.map((pedido, index) => (
                        <div className="accordion-item" key={pedido._id}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse${index}`}
                                >
                                    Pedido #{index + 1} – {pedido.estado?.toUpperCase()} –{" "}
                                    <span className="text-muted ms-2">
                                        {new Date(pedido.fecha_creacion).toLocaleString()}
                                    </span>
                                </button>
                            </h2>

                            <div
                                id={`collapse${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${index}`}
                                data-bs-parent="#accordionAsesor"
                            >
                                <div className="accordion-body">

                                    {/* Productos */}
                                    <h5 className="mt-3">Productos:</h5>
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Referencia</th>
                                                    <th>Color</th>
                                                    <th>Categoría</th>
                                                    <th>Código</th>
                                                    <th>Marca</th>
                                                    <th>Pedida</th>
                                                    <th>Modificada</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedido.productos?.length > 0 ? (
                                                    pedido.productos.map((prod, i) => (
                                                        <tr key={i}>
                                                            <td>{prod.referencia}</td>
                                                            <td>{prod.colores}</td>
                                                            <td>{prod.categoria}</td>
                                                            <td>{prod.codigo}</td>
                                                            <td>{prod.marca}</td>

                                                            {/* CANTIDAD ORIGINAL */}
                                                            <td>{prod.cantidad}</td>

                                                            {/* CANTIDAD AJUSTADA POR ADMIN */}
                                                            <td>{prod.cantidad_modificada}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">
                                                            Sin productos
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>

                                        </table>
                                    </div>

                                    {/* Historial */}
                                        <div className="mt-3">
                                        <h6>Historial:</h6>
                                        <ul>
                                            {pedido.historial?.map((h, i) => (
                                                <li key={i} className="mb-2">

                                                    {/* CAMBIO DE ESTADO */}
                                                    {h.estado && (
                                                        <>
                                                            <strong>Cambio de estado:</strong> {h.estado.toUpperCase()} –{" "}
                                                            {new Date(h.fecha).toLocaleString()}
                                                            {h.motivo && (
                                                                <div className="text-danger ms-3">
                                                                    <strong>Motivo:</strong> {h.motivo}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* CAMBIO DE CANTIDAD */}
                                                    {h.accion === "modificacion_cantidad" && (
                                                        <div>
                                                            <strong>Modificación de cantidad:</strong> {h.producto_referencia}
                                                            <br />
                                                            Cantidad antes: <strong>{h.cantidad_antes}</strong>
                                                            <br />
                                                            Cantidad después: <strong>{h.cantidad_despues}</strong>
                                                            <br />
                                                            Fecha: {new Date(h.fecha).toLocaleString()}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
