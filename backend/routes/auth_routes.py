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
            "role": user["rol"],
            "token": access_token,
            "sucursal_id": user.get("sucursal_id")
        }), 200

    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401


def register_user(data):
    nombre = data.get("nombre")
    correo = data.get("correo")
    password = data.get("password")
    rol = data.get("rol", "asesor")
    sucursal_id = data.get("sucursal_id")

    # Validaciones mínimas
    if not correo or not password or not nombre:
        return jsonify({"msg": "Nombre, correo y contraseña son requeridos"}), 400

    # Verificar si ya existe el usuario por correo
    existing_user = mongo.db.users.find_one({"correo": correo})
    if existing_user:
        return jsonify({"msg": "El correo ya está registrado"}), 400

    # Hashear contraseña
    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    # Crear documento usuario
    nuevo_usuario = {
        "nombre": nombre,
        "correo": correo,
        "password": hashed_pw,
        "rol": rol,
        "sucursal_id": sucursal_id
    }

    mongo.db.users.insert_one(nuevo_usuario)

    return jsonify({
        "msg": "Usuario registrado exitosamente",
        "role": rol
    }), 201
