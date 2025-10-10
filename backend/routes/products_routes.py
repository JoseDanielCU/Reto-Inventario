from flask import request, jsonify
from models.products import ProductModel
from flask_jwt_extended import get_jwt_identity, get_jwt

def crear_producto():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado: solo administradores pueden crear productos"}), 403

    data = request.get_json()
    producto = ProductModel.create_producto(data)
    producto["_id"] = str(producto["_id"])
    return jsonify({"msg": "Producto creado", "producto": producto}), 201


def listar_productos():

    categoria = request.args.get("categoria")
    marca = request.args.get("marca")
    search = request.args.get("search")
    codigo = request.args.get("codigo")

    query = {}
    if categoria:
        query["categoria"] = categoria
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    if codigo:
        query["codigo"] = {"$regex": codigo, "$options": "i"}
    if search:
        query["$or"] = [
            {"nombre": {"$regex": search, "$options": "i"}},
            {"modelo": {"$regex": search, "$options": "i"}},
            {"categoria": {"$regex": search, "$options": "i"}},
            {"codigo": {"$regex": search, "$options": "i"}},
            {"marca": {"$regex": search, "$options": "i"}}
        ]

    productos = ProductModel.get_all(query)
    for p in productos:
        p["_id"] = str(p["_id"])

    return jsonify(productos), 200

def actualizar_producto(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    data = request.get_json()
    if "_id" in data:
        del data["_id"]

    result = ProductModel.update_producto(id, data)
    if result.modified_count > 0:
        return jsonify({"msg": "Producto actualizado"}), 200
    else:
        return jsonify({"msg": "No se encontró el producto o no hubo cambios"}), 404

def eliminar_producto(id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    result = ProductModel.delete_producto(id)
    if result.deleted_count > 0:
        return jsonify({"msg": "Producto eliminado"}), 200
    else:
        return jsonify({"msg": "Producto no encontrado"}), 404