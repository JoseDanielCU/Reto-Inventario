from flask import request, jsonify
from models.products import ProductModel

def crear_producto(data):
    producto = ProductModel.create_producto(data)
    producto["_id"] = str(producto["_id"])  # Convertir ObjectId
    return jsonify({"msg": "Producto creado", "producto": producto}), 201


def listar_productos():
    categoria = request.args.get("categoria")
    marca = request.args.get("marca")
    search = request.args.get("search")

    query = {}

    if categoria:
        query["categoria"] = categoria
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}  # búsqueda flexible
    if search:
        query["$or"] = [
            {"nombre": {"$regex": search, "$options": "i"}},
            {"modelo": {"$regex": search, "$options": "i"}},
            {"categoria": {"$regex": search, "$options": "i"}},
            {"codigo": {"$regex": search, "$options": "i"}},
            {"marca": {"$regex": search, "$options": "i"}}
        ]

    productos = ProductModel.get_all(query)

    # Convertir ObjectId a str
    for p in productos:
        p["_id"] = str(p["_id"])

    return jsonify(productos), 200