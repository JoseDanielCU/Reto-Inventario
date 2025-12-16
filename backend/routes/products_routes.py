from flask import request, jsonify
from models.products import ProductModel
from flask_jwt_extended import get_jwt_identity, get_jwt
import pandas as pd

def crear_producto():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado: solo administradores pueden crear productos"}), 403

    data = request.get_json()
    producto = ProductModel.create_producto(data)
    producto["_id"] = str(producto["_id"])
    return jsonify({"msg": "Producto creado", "producto": producto}), 201


def listar_productos():
    claims = get_jwt()
    rol = claims.get("rol")
    activo = request.args.get("activo")

    categoria = request.args.get("categoria")
    marca = request.args.get("marca")
    search = request.args.get("search")
    codigo = request.args.get("codigo")

    query = {}

    # Si NO es admin, solo mostrar activos
    if rol == "admin" and activo is not None:
        query["activo"] = True if activo == "true" else False
    elif rol != "admin":
        query["activo"] = True
    if categoria:
        query["categoria"] = categoria
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    if codigo:
        query["codigo"] = {"$regex": codigo, "$options": "i"}
    if search:
        query["$or"] = [
            {"referencia": {"$regex": search, "$options": "i"}},
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
    if claims.get("rol") != "admin":
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
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    result = ProductModel.delete_producto(id)
    if result.deleted_count > 0:
        return jsonify({"msg": "Producto eliminado"}), 200
    else:
        return jsonify({"msg": "Producto no encontrado"}), 404

def listar_categorias():
    try:
        categorias = ProductModel.get_distinct_categories()
        return jsonify(categorias), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener categorías", "error": str(e)}), 500
def cambiar_estado_producto(id):
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    data = request.get_json()
    estado = data.get("activo")

    if estado is None:
        return jsonify({"msg": "Falta el campo 'activo'"}), 400

    if isinstance(estado, str):
        estado = estado.lower() == "true"

    result = ProductModel.set_activo(id, estado)

    if result.modified_count > 0:
        return jsonify({"msg": "Estado actualizado"}), 200
    else:
        return jsonify({"msg": "No se encontró el producto o no hubo cambios"}), 404

def cargar_productos_csv():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    data = request.get_json()
    if not data or "productos" not in data:
        return jsonify({"msg": "No se envió la lista de productos"}), 400

    productos = data["productos"]
    insertados = 0
    actualizados = 0
    errores = []

    for p in productos:
        try:
            producto = {
                "referencia": str(p.get("referencia", "")).strip(),
                "categoria": str(p.get("categoria", "")).strip(),
                "codigo": str(p.get("codigo", "")).strip(),
                "marca": str(p.get("marca") or "").strip(),
                "descripcion": str(p.get("descripcion") or "").strip(),
                "imagen": str(p.get("imagen") or "").strip(),
                "colores": p.get("colores") or [],
                "activo": True
            }

            if isinstance(producto["colores"], str):
                producto["colores"] = [c.strip() for c in producto["colores"].split(",") if c.strip()]

            if not producto["codigo"] or not producto["referencia"] or not producto["categoria"]:
                errores.append(f"Faltan campos obligatorios: {producto}")
                continue

            print("Procesando producto:", producto)  # <-- para debug

            existente = ProductModel.get_one({"codigo": producto["codigo"]})
            if existente:
                ProductModel.update_producto(str(existente["_id"]), producto)
                actualizados += 1
            else:
                ProductModel.create_producto(producto)
                insertados += 1

        except Exception as e:
            errores.append(f"{p.get('codigo', '???')}: {str(e)}")

    return jsonify({
        "msg": "Carga completada",
        "insertados": insertados,
        "actualizados": actualizados,
        "errores": errores
    }), 200

