from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from models.orders import OrdersModel

def crear_pedido():
    identity = get_jwt_identity()
    claims = get_jwt()
    data = request.get_json()
    if not data or not data.get("productos"):
        return jsonify({"msg": "El pedido está vacío"}), 400

    pedido = OrdersModel.create_order({
        "asesor_id": identity,
        "sucursal_id": claims.get("sucursal_id"),
        "productos": data["productos"]
    })

    pedido["_id"] = str(pedido.get("_id", ""))
    return jsonify({"msg": "Pedido creado correctamente", "pedido": pedido}), 201

def pedidos_por_sucursal(sucursal_id):
    pedidos = OrdersModel.get_by_sucursal(sucursal_id)
    for p in pedidos:
        p["_id"] = str(p["_id"])
    return jsonify(pedidos), 200
