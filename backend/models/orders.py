from models.mongodb import mongo
from datetime import datetime
from bson import ObjectId

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
        mongo.db[OrdersModel.collection].insert_one(pedido)
        return pedido

    @staticmethod
    def get_by_sucursal(sucursal_id):
        return list(mongo.db[OrdersModel.collection].find({"sucursal_id": sucursal_id}))

    @staticmethod
    def update_estado(pedido_id, nuevo_estado):
        mongo.db[OrdersModel.collection].update_one(
            {"_id": ObjectId(pedido_id)},
            {
                "$set": {"estado": nuevo_estado},
                "$push": {"historial": {"estado": nuevo_estado, "fecha": datetime.utcnow()}}
            }
        )
