import { useState, useEffect } from "react";
import NavbarAsesor from "../../components/Asesor/NavbarAsesor";

export default function Carrito() {
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  const actualizarCantidad = (id, cantidad) => {
    const nuevo = carrito.map((item) =>
      item._id === id ? { ...item, cantidad: Number(cantidad) } : item
    );
    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };

  const eliminarDelCarrito = (id) => {
    const nuevo = carrito.filter((item) => item._id !== id);
    setCarrito(nuevo);
    localStorage.setItem("carrito", JSON.stringify(nuevo));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
  };

  const enviarPedido = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productos: carrito }),
      });

      if (res.ok) {
        alert("Pedido enviado correctamente");
        vaciarCarrito();
      } else {
        const err = await res.json();
        alert(`Error: ${err.msg || "No se pudo enviar el pedido"}`);
      }
    } catch (err) {
      console.error("Error al enviar pedido:", err);
    }
  };

  return (
     <div className="d-flex flex-column min-vh-100">

    <NavbarAsesor
      carritoCount={carrito.reduce((sum, item) => sum + item.cantidad, 0)}
      user={JSON.parse(localStorage.getItem("user") || "{}")}
    />

    <div className="container py-4 flex-grow-1">
      <h2 className="text-danger mb-4">🛒 Carrito de Compras</h2>

      {carrito.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item) => (
                <tr key={item._id}>
                  <td>{item.referencia}</td>
                  <td>{item.marca}</td>
                  <td>{item.categoria}</td>
                  <td>{item.codigo}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      style={{ width: "80px" }}
                      value={item.cantidad || 1}
                      onChange={(e) =>
                        actualizarCantidad(item._id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarDelCarrito(item._id)}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-secondary" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
            <button className="btn btn-danger" onClick={enviarPedido}>
              Enviar pedido
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
}
