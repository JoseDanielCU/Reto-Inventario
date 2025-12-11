from bson import ObjectId
from models.mongodb import mongo


class ProductModel:
    collection = "productos"

    @staticmethod
    def create_producto(data):
        producto = {
            "referencia": data["referencia"],
            "categoria": data["categoria"],
            "codigo": data["codigo"],
            "marca": data.get("marca"),
            "descripcion": data.get("descripcion", ""),
            "imagen": data.get("imagen"),
            "activo": data.get("activo", True)
        }
        result = mongo.db[ProductModel.collection].insert_one(producto)
        producto["_id"] = result.inserted_id
        return producto

    @staticmethod
    def get_all(filters=None):
        if filters is None:
            filters = {}
        return list(mongo.db[ProductModel.collection].find(filters))

    @staticmethod
    def update_producto(id, data):
        return mongo.db.productos.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )

    @staticmethod
    def delete_producto(id):
        return mongo.db.productos.delete_one({"_id": ObjectId(id)})

    @staticmethod
    def get_distinct_categories():
        return mongo.db[ProductModel.collection].distinct("categoria")

    @staticmethod
    def set_activo(id, estado: bool):
        return mongo.db.productos.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"activo": estado}}
        )
