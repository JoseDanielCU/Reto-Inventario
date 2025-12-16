from models.mongodb import mongo, bcrypt
from bson import ObjectId


class UserModel:
    collection = "users"

    @staticmethod
    def create_user(data):
        hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = {
            "nombre": data["nombre"],
            "apellidos": data.get("apellidos", ""),
            "correo": data["correo"],
            "password": hashed_pw,
            "rol": data.get("rol", "asesor"),
            "sucursal_id": data.get("sucursal_id")
        }
        mongo.db[UserModel.collection].insert_one(user)
        return user

    @staticmethod
    def find_by_email(correo):
        return mongo.db[UserModel.collection].find_one({"correo": correo})

    @staticmethod
    def update_user(id, data):
        return mongo.db.users.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )
