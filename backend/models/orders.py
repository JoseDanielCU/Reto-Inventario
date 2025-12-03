from models.mongodb import mongo
from datetime import datetime
from bson import ObjectId, errors as bson_errors

class OrdersModel:
    collection = "pedidos"

    @staticmethod
    def create_order(data):
        pedido = {
            "asesor_id": data["asesor_id"],
            "sucursal_id": str(data["sucursal_id"]),
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
        sucursal_id = str(sucursal_id)

        try:
            sucursal = mongo.db["Sucursales"].find_one({"_id": ObjectId(sucursal_id)})
        except bson_errors.InvalidId:
            sucursal = mongo.db["Sucursales"].find_one({"_id": sucursal_id})

        if sucursal:
            return sucursal.get("nombre", "Desconocida")

        return f"ID: {sucursal_id}"

    @staticmethod
    def update_status(pedido_id, nuevo_estado, motivo=None):
        pedido = mongo.db.pedidos.find_one({"_id": ObjectId(pedido_id)})

        if not pedido:
            return False

        historial_entry = {
            "estado": nuevo_estado,
            "fecha": datetime.utcnow()
        }

        if motivo:
            historial_entry["motivo"] = motivo

        result = mongo.db.pedidos.update_one(
            {"_id": ObjectId(pedido_id)},
            {
                "$set": {
                    "estado": nuevo_estado
                },
                "$push": {
                    "historial": historial_entry
                }
            }
        )

        return result.modified_count > 0

    @staticmethod
    def approve_order(pedido_id, productos_aprobados):
        try:
            pedido_oid = ObjectId(pedido_id)
        except:
            return False

        result = mongo.db[OrdersModel.collection].update_one(
            {"_id": pedido_oid},
            {
                "$set": {
                    "productos": productos_aprobados,
                    "estado": "aprobado"
                },
                "$push": {
                    "historial": {
                        "estado": "aprobado",
                        "fecha": datetime.utcnow()
                    }
                }
            }
        )

        print("Modified count:", result.modified_count)
        return result.modified_count == 1

