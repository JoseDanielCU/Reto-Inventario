# routes/users_routes.py
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity,get_jwt
from models.users import UserModel, bcrypt
from models.users import mongo, bcrypt
from models.Sucursales import SucursalesModel
from bson import ObjectId


from flask_jwt_extended import get_jwt

def es_admin():
    claims = get_jwt()
    return claims.get("rol") == "admin"


def listar_usuarios():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    usuarios = []

    for u in mongo.db.users.find():
        u["_id"] = str(u["_id"])

        # Resolver sucursal
        sucursal_nombre = "Sin sucursal"
        sucursal_id = u.get("sucursal_id")

        if sucursal_id:
            sucursal = SucursalesModel.get_by_id(sucursal_id)
            if sucursal:
                sucursal_nombre = sucursal.get("nombre", "Sin sucursal")

        usuarios.append({
            "_id": u["_id"],
            "nombre": u.get("nombre"),
            "correo": u.get("correo"),
            "rol": u.get("rol"),
            "activo": u.get("activo", True),
            "sucursal_id": sucursal_id,
            "sucursal_nombre": sucursal_nombre
        })

    return jsonify(usuarios), 200



def crear_usuario():
    if not es_admin():
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()

    requeridos = ["nombre", "correo", "password"]
    for r in requeridos:
        if not data.get(r):
            return jsonify({"msg": f"Campo obligatorio faltante: {r}"}), 400

    if UserModel.find_by_email(data["correo"]):
        return jsonify({"msg": "El correo ya existe"}), 409

    user = UserModel.create_user(data)
    user.pop("password", None)

    return jsonify({"msg": "Usuario creado correctamente"}), 201


def actualizar_usuario(id):
    if not es_admin():
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    update = {}

    if "nombre" in data:
        update["nombres"] = data["nombre"]
    if "apellidos" in data:
        update["apellidos"] = data["apellidos"]
    if "correo" in data:
        update["correo"] = data["correo"]
    if "rol" in data:
        update["rol"] = data["rol"]
    if "sucursal_id" in data:
        update["sucursal_id"] = data["sucursal_id"]
    if data.get("password"):
        update["password"] = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

    mongo.db[UserModel.collection].update_one(
        {"_id": ObjectId(id)},
        {"$set": update}
    )

    return jsonify({"msg": "Usuario actualizado"})


def cambiar_estado_usuario(id):
    if not es_admin():
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    activo = data.get("activo", True)

    mongo.db[UserModel.collection].update_one(
        {"_id": ObjectId(id)},
        {"$set": {"activo": activo}}
    )

    return jsonify({"msg": "Estado actualizado"})

def eliminar_usuario(id):
    if not es_admin():
        return jsonify({"msg": "No autorizado"}), 403

    usuario = mongo.db[UserModel.collection].find_one({"_id": ObjectId(id)})

    if not usuario:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    mongo.db[UserModel.collection].delete_one({"_id": ObjectId(id)})

    return jsonify({"msg": "Usuario eliminado correctamente"}), 200


def cargar_usuarios_csv():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    data = request.get_json()
    if not data or "usuarios" not in data:
        return jsonify({"msg": "No se envió la lista de usuarios"}), 400

    usuarios = data["usuarios"]
    insertados = 0
    actualizados = 0
    errores = []

    for u in usuarios:
        try:
            correo = str(u.get("correo", "")).strip().lower()
            if not correo:
                errores.append("Correo vacío")
                continue

            user_data = {
                "nombre": str(u.get("nombre", "")).strip(),
                "correo": correo,
                "rol": u.get("rol", "user"),
                "activo": u.get("activo", True),
                "sucursal_id": ObjectId(u["sucursal_id"]) if u.get("sucursal_id") else None
            }

            existente = UserModel.find_by_email(correo)

            # Crear
            if not existente:
                if not u.get("password"):
                    errores.append(f"{correo}: contraseña requerida")
                    continue

                user_data["password"] = bcrypt.generate_password_hash(
                    u["password"]
                ).decode("utf-8")

                UserModel.create_user(user_data)
                insertados += 1

            # Actualizar
            else:
                update = {k: v for k, v in user_data.items() if v is not None}

                if u.get("password"):
                    update["password"] = bcrypt.generate_password_hash(
                        u["password"]
                    ).decode("utf-8")

                UserModel.update_user(str(existente["_id"]), update)
                actualizados += 1

        except Exception as e:
            errores.append(f"{u.get('correo', '???')}: {str(e)}")

    return jsonify({
        "msg": "Carga de usuarios completada",
        "insertados": insertados,
        "actualizados": actualizados,
        "errores": errores
    }), 200