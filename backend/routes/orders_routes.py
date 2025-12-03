from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.orders import OrdersModel
from models.Sucursales import SucursalesModel
from datetime import datetime
from bson import ObjectId


def serialize_pedido(p):
    p["_id"] = str(p["_id"])
    p["fecha_creacion"] = p.get("fecha_creacion", datetime.utcnow()).isoformat()

    # ➤ Buscar sucursal
    sucursal = SucursalesModel.get_by_id(p["sucursal_id"])
    if sucursal:
        p["sucursal_nombre"] = sucursal["nombre"]
    else:
        p["sucursal_nombre"] = "Sucursal desconocida"

    # Historial fechas
    if "historial" in p:
        for h in p["historial"]:
            if isinstance(h.get("fecha"), datetime):
                h["fecha"] = h["fecha"].isoformat()

    return p


def crear_pedido():
    identity = get_jwt_identity()
    claims = get_jwt()
    data = request.get_json()
    print("📦 creando pedido con datos:", data)  # 👈 agrega esta línea

    if not data or not data.get("productos"):
        return jsonify({"msg": "El pedido está vacío"}), 400

    sucursal_id = claims.get("sucursal_id")
    if not sucursal_id:
        return jsonify({"msg": "No se encontró la sucursal del asesor"}), 400

    pedido = OrdersModel.create_order({
        "asesor_id": identity,
        "sucursal_id": sucursal_id,
        "productos": data["productos"]
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
