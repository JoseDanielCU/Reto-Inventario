from models.mongodb import mongo
from datetime import datetime
from bson import ObjectId, errors as bson_errors

class OrdersModel:
    collection = "pedidos"

    @staticmethod
    def create_order(data):
        pedido = {
            "asesor_id": data["asesor_id"],
            "sucursal_id": data["sucursal_id"],
            "productos": data["productos"],  # lista de {producto_id, cantidad}
            "estado": "pendiente",
            "historial": [
                {"estado": "pendiente", "fecha": datetime.utcnow()}
            ],
            "fecha_creacion": datetime.utcnow()
        }
        result = mongo.db[OrdersModel.collection].insert_one(pedido)
        pedido["_id"] = str(result.inserted_id)
        return pedido

    @staticmethod
    def get_by_sucursal(sucursal_id):
        pedidos = list(mongo.db[OrdersModel.collection].find({"sucursal_id": sucursal_id}))
        for p in pedidos:
            p["_id"] = str(p["_id"])
            p["sucursal_nombre"] = OrdersModel._get_sucursal_nombre(p.get("sucursal_id"))
        return pedidos

    @staticmethod
    def get_all():
        pedidos = list(mongo.db[OrdersModel.collection].find())
        for p in pedidos:
            p["_id"] = str(p["_id"])
            p["sucursal_nombre"] = OrdersModel._get_sucursal_nombre(p.get("sucursal_id"))
        return pedidos

    @staticmethod
    def _get_sucursal_nombre(sucursal_id):
        if not sucursal_id:
            return "Desconocida"
        sucursal = None
        try:
            sucursal = mongo.db["Sucursales"].find_one({"_id": ObjectId(sucursal_id)})
        except bson_errors.InvalidId:
            sucursal = mongo.db["Sucursales"].find_one({"_id": sucursal_id}) or \
                       mongo.db["Sucursales"].find_one({"nombre": sucursal_id})

        if sucursal:
            return sucursal.get("nombre", "Desconocida")

        return f"ID: {sucursal_id}"

