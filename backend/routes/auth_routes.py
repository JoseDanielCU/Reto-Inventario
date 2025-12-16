from flask import jsonify
from models.users import UserModel, bcrypt
from flask_jwt_extended import create_access_token
from models.users import mongo, bcrypt
from datetime import timedelta
from bson import ObjectId


def login_user(data):
    correo = data.get("correo")
    password = data.get("password")

    user = mongo.db.users.find_one({"correo": correo})
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if bcrypt.check_password_hash(user["password"], password):
        sucursal_id = user.get("sucursal_id")
        if isinstance(sucursal_id, ObjectId):
            sucursal_id = str(sucursal_id)

        # Crear token JWT con claims adicionales
        access_token = create_access_token(
            identity=correo,
            additional_claims={
                "rol": user.get("rol", "asesor"),
                "sucursal_id": sucursal_id
            },
            expires_delta=timedelta(hours=1)
        )

        return jsonify({
            "msg": "Login exitoso",
            "rol": user["rol"],
            "token": access_token,
            "sucursal_id": user.get("sucursal_id")
        }), 200

    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401
