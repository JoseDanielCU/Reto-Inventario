import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const fetchPedidos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pedidos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar pedidos");
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-danger mb-4">Pedidos Registrados</h2>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      {pedidos.length === 0 ? (
        <p>No hay pedidos registrados</p>
      ) : (
        <div className="accordion" id="accordionPedidos">
          {pedidos.map((pedido, index) => (
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
                  Pedido #{index + 1} – {pedido.estado.toUpperCase()} –{" "}
                  <span className="text-muted ms-2">
                    {new Date(pedido.fecha_creacion).toLocaleString()}
                  </span>
                </button>
              </h2>

              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${index}`}
                data-bs-parent="#accordionPedidos"
              >
                <div className="accordion-body">
                  <p><strong>Asesor:</strong> {pedido.asesor_id}</p>
                  <p><strong>Sucursal:</strong> {pedido.sucursal_id}</p>

                  <h5 className="mt-3">Productos en el pedido:</h5>
                  <div className="table-responsive">
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
                        {pedido.productos && pedido.productos.length > 0 ? (
                          pedido.productos.map((prod, i) => (
                            <tr key={i}>
                              <td>{prod.nombre}</td>
                              <td>{prod.modelo}</td>
                              <td>{prod.categoria}</td>
                              <td>{prod.codigo}</td>
                              <td>{prod.marca}</td>
                              <td>{prod.cantidad}</td>
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

                  <div className="mt-3">
                    <h6>Historial de estados:</h6>
                    <ul>
                      {pedido.historial?.map((h, i) => (
                        <li key={i}>
                          {h.estado} –{" "}
                          {new Date(h.fecha).toLocaleString()}
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
