from flask import jsonify
from models.orders import OrdersModel

def crear_pedido(user, data):
    data["asesor_id"] = user["usuario"]
    pedido = OrdersModel.create_pedido(data)
    return jsonify({"msg": "Pedido creado", "pedido": str(pedido)}), 201

def pedidos_por_sucursal(sucursal_id):
    pedidos = OrdersModel.get_by_sucursal(sucursal_id)
    return jsonify(pedidos), 200
