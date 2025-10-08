# routes/branches_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt
from models.Sucursales import SucursalesModel

def crear_sucursal():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    if not data or not data.get("nombre"):
        return jsonify({"msg": "Falta el nombre de la sucursal"}), 400

    sucursal = SucursalesModel.create_sucursal(data)
    return jsonify({"msg": "Sucursal creada", "sucursal": sucursal}), 201

def actualizar_sucursal(id):
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Datos inválidos"}), 400

    if "_id" in data:
        del data["_id"]

    result = SucursalesModel.update_sucursal(id, data)
    if result.modified_count > 0:
        return jsonify({"msg": "Sucursal actualizada"}), 200
    else:
        return jsonify({"msg": "No se encontró la sucursal o no hubo cambios"}), 404
def listar_sucursales():
    sucursales = SucursalesModel.get_all()
    return jsonify(sucursales), 200
