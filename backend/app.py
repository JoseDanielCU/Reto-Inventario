from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from config import config
from models.mongodb import mongo, bcrypt
from dotenv import load_dotenv
# Rutas
from routes.auth_routes import login_user
from routes.orders_routes import crear_pedido, pedidos_por_sucursal, obtener_todos_los_pedidos, aprobar_pedido, \
    cambiar_estado_pedido, actualizar_cantidades
from routes.products_routes import crear_producto, listar_productos, actualizar_producto, eliminar_producto, \
    listar_categorias, cambiar_estado_producto,cargar_productos_csv
from routes.Sucursales_routes import crear_sucursal, listar_sucursales, actualizar_sucursal, eliminar_sucursal
from routes.user_route import listar_usuarios,crear_usuario,actualizar_usuario,cambiar_estado_usuario,cargar_usuarios_csv
load_dotenv()
app = Flask(__name__)
app.config.from_object(config)

# Extensiones
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Authorization", "Content-Type"],
}})


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


mongo.init_app(app)
bcrypt.init_app(app)
JWTManager(app)


# RUTAS

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    return login_user(data)


@app.route("/api/pedidos", methods=["POST"])
@jwt_required()
def crear_pedido_route():
    return crear_pedido()


@app.route("/api/pedidos", methods=["GET"])
@jwt_required()
def obtener_todos_los_pedidos_route():
    return obtener_todos_los_pedidos()


@app.route("/api/pedidos/sucursal/<sucursal_id>", methods=["GET"])
@jwt_required()
def pedidos_sucursal_route(sucursal_id):
    return pedidos_por_sucursal(sucursal_id)


@app.route("/api/productos", methods=["POST"])
@jwt_required()
def crear_producto_route():
    return crear_producto()


@app.route("/api/productos", methods=["GET"])
@jwt_required()
def listar_productos_route():
    return listar_productos()


@app.route("/api/productos/<id>", methods=["PUT"])
@jwt_required()
def actualizar_producto_route(id):
    return actualizar_producto(id)


@app.route("/api/productos/<id>", methods=["DELETE"])
@jwt_required()
def eliminar_producto_route(id):
    return eliminar_producto(id)


@app.route("/api/sucursales", methods=["POST"])
@jwt_required()
def crear_sucursal_route():
    return crear_sucursal()


@app.route("/api/sucursales/", methods=["GET"])
def obtener_sucursal_route():
    return listar_sucursales()


@app.route("/api/sucursales/<id>", methods=["PUT"])
@jwt_required()
def actualizar_sucursal_route(id):
    return actualizar_sucursal(id)


@app.route("/api/sucursales/<id>", methods=["DELETE"])
@jwt_required()
def eliminar_sucursal_route(id):
    return eliminar_sucursal(id)


@app.route("/api/categorias", methods=["GET"])
def listar_categorias_route():
    return listar_categorias()


@app.route("/api/pedidos/<id>/aprobar", methods=["PUT"])
@jwt_required()
def aprobar_pedido_route(id):
    data = request.get_json()
    motivo = data.get("motivo", "Sin especificar")
    return aprobar_pedido(id,motivo)


@app.route("/api/pedidos/<id>/actualizar-cantidades", methods=["PUT"])
@jwt_required()
def actualizar_cantidades_route(id):
    return actualizar_cantidades(id)


@app.route("/api/pedidos/<id>/enviar", methods=["PUT"])
@jwt_required()
def enviar_pedido_route(id):
    data = request.get_json()
    motivo = data.get("motivo", "Sin especificar")
    return cambiar_estado_pedido(id, "enviado", motivo)


@app.route("/api/pedidos/<id>/cancelar", methods=["PUT"])
@jwt_required()
def cancelar_pedido_route(id):
    data = request.get_json()
    motivo = data.get("motivo", "Sin especificar")
    return cambiar_estado_pedido(id, "cancelado", motivo)

@app.route("/api/productos/<id>/estado", methods=["PUT"])
@jwt_required()
def cambiar_estado_producto_route(id):
    return cambiar_estado_producto(id)
@app.route("/api/productos/upload-csv", methods=["POST"])
@jwt_required()
def upload_csv_route():
    return cargar_productos_csv()

# ===== USUARIOS =====

@app.route("/api/usuarios", methods=["GET"])
@jwt_required()
def listar_usuarios_route():
    return listar_usuarios()


@app.route("/api/usuarios", methods=["POST"])
@jwt_required()
def crear_usuario_route():
    return crear_usuario()


@app.route("/api/usuarios/<id>", methods=["PUT"])
@jwt_required()
def actualizar_usuario_route(id):
    return actualizar_usuario(id)


@app.route("/api/usuarios/<id>/estado", methods=["PUT"])
@jwt_required()
def cambiar_estado_usuario_route(id):
    return cambiar_estado_usuario(id)

@app.route("/api/usuarios/upload-csv", methods=["POST"])
@jwt_required()
def upload_usuarios_csv_route():
    return cargar_usuarios_csv()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

