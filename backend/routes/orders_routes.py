from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.orders import OrdersModel
from models.Sucursales import SucursalesModel
from models.mongodb import mongo
from datetime import datetime
from bson import ObjectId


def serialize_pedido(p):
    p["_id"] = str(p["_id"])
    p["fecha_creacion"] = p.get("fecha_creacion", datetime.utcnow()).isoformat()

    sucursal = SucursalesModel.get_by_id(p["sucursal_id"])
    if sucursal:
        p["sucursal_nombre"] = sucursal["nombre"]
    else:
        p["sucursal_nombre"] = "Sucursal desconocida"

    if "historial" in p:
        for h in p["historial"]:
            if isinstance(h.get("fecha"), datetime):
                h["fecha"] = h["fecha"].isoformat()

    return p


def crear_pedido():
    identity = get_jwt_identity()
    claims = get_jwt()
    data = request.get_json()

    if not data or not data.get("productos"):
        return jsonify({"msg": "El pedido está vacío"}), 400
    productos = data["productos"]
    for p in productos:
        p["cantidad_modificada"] = p["cantidad"]

    sucursal_id = str(claims.get("sucursal_id"))
    if not sucursal_id:
        return jsonify({"msg": "No se encontró la sucursal del asesor"}), 400

    pedido = OrdersModel.create_order({
        "asesor_id": identity,
        "sucursal_id": sucursal_id,
        "productos": productos
    })

    pedido["_id"] = str(pedido.get("_id", ""))
    return jsonify({"msg": "Pedido creado correctamente", "pedido": pedido}), 201


def pedidos_por_sucursal(sucursal_id):
    pedidos = OrdersModel.get_by_sucursal(sucursal_id)
    pedidos_serializados = [serialize_pedido(p) for p in pedidos]
    return jsonify(pedidos_serializados), 200


def obtener_todos_los_pedidos():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    pedidos = OrdersModel.get_all()
    pedidos_serializados = [serialize_pedido(p) for p in pedidos]
    return jsonify(pedidos_serializados), 200


def cambiar_estado_pedido(pedido_id, nuevo_estado, motivo=None):
    resultado = OrdersModel.update_status(pedido_id, nuevo_estado, motivo)

    if not resultado:
        return jsonify({"msg": "Pedido no encontrado"}), 404

    return jsonify({"msg": f"Pedido {nuevo_estado} correctamente"}), 200


def aprobar_pedido(pedido_id, motivo=None):
    actualizado = OrdersModel.update_status(pedido_id, "aprobado", motivo)

    if not actualizado:
        return jsonify({"msg": "No se pudo aprobar el pedido"}), 400

    return jsonify({"msg": "Pedido aprobado correctamente"}), 200


def actualizar_cantidades(id):
    data = request.json
    productos_modificados = data.get("productos")

    if not productos_modificados:
        return jsonify({"error": "No hay productos"}), 400

    # Obtener pedido original
    pedido = mongo.db.pedidos.find_one({"_id": ObjectId(id)})
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    productos_originales = pedido["productos"]
    historial = pedido.get("historial", [])

    admin_id = get_jwt_identity()  # Capturamos quién hace el cambio

    # Recorrer productos y actualizar solo cantidad_modificada
    for i, prod_original in enumerate(productos_originales):

        cantidad_original = prod_original.get("cantidad_modificada", prod_original.get("cantidad"))
        nueva_cantidad = productos_modificados[i].get("cantidad_modificada")

        # Si no hay cambio, no registramos nada
        if nueva_cantidad is None or nueva_cantidad == cantidad_original:
            continue

        # Actualizar la cantidad
        prod_original["cantidad_modificada"] = nueva_cantidad

        # Registrar en historial
        historial.append({
            "accion": "modificacion_cantidad",
            "producto_referencia": prod_original.get("referencia"),
            "cantidad_antes": cantidad_original,
            "cantidad_despues": nueva_cantidad,
            "fecha": datetime.utcnow(),
            "realizado_por": str(admin_id)
        })

    # Guardar cambios
    result = mongo.db.pedidos.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "productos": productos_originales,
                "historial": historial
            }
        }
    )

    if result.modified_count == 0:
        return jsonify({"error": "No se pudo actualizar"}), 500

    return jsonify({"msg": "Cantidades actualizadas correctamente"}), 200


