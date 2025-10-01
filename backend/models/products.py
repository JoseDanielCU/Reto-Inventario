from models.mongodb import mongo

class ProductModel:
    collection = "productos"

    @staticmethod
    def create_producto(data):
        producto = {
            "nombre": data["nombre"],
            "modelo": data.get("modelo"),
            "categoria": data["categoria"],
            "codigo": data["codigo"],
            "marca": data.get("marca"),
            "descripcion": data.get("descripcion", ""),
            "imagen": data.get("imagen")
        }
        result = mongo.db[ProductModel.collection].insert_one(producto)
        producto["_id"] = result.inserted_id
        return producto

    @staticmethod
    def get_all(filters=None):
        if filters is None:
            filters = {}
        return list(mongo.db[ProductModel.collection].find(filters))
