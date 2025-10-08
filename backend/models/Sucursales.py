# models/branches.py
from models.mongodb import mongo
from datetime import datetime
from bson import ObjectId

class SucursalesModel:
    collection = "Sucursales"

    @staticmethod
    def create_sucursal(data):
        sucursal = {
            "nombre": data["nombre"],
            "direccion": data.get("direccion", ""),
            "telefono": data.get("telefono", ""),
            "correo": data.get("correo", ""),
            "fecha_creacion": datetime.utcnow()
        }
        result = mongo.db[SucursalesModel.collection].insert_one(sucursal)
        sucursal["_id"] = str(result.inserted_id)
        return sucursal

    @staticmethod
    def get_all():
        sucursales = list(mongo.db[SucursalesModel.collection].find())
        for s in sucursales:
            s["_id"] = str(s["_id"])
        return sucursales

    @staticmethod
    def get_by_id(id):
        sucursal = mongo.db[SucursalesModel.collection].find_one({"_id": ObjectId(id)})
        if sucursal:
            sucursal["_id"] = str(sucursal["_id"])
        return sucursal

    @staticmethod
    def update_sucursal(id, data):
        result = mongo.db[SucursalesModel.collection].update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return result

    @staticmethod
    def delete_sucursal(id):
        result = mongo.db[SucursalesModel.collection].delete_one({"_id": ObjectId(id)})
        return result
