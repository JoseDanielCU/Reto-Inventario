from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from config import config
from models.mongodb import mongo, bcrypt
from dotenv import load_dotenv
# Rutas
from routes.auth_routes import login_user, register_user
from routes.orders_routes import crear_pedido, pedidos_por_sucursal
from routes.products_routes import crear_producto, listar_productos, actualizar_producto, eliminar_producto
from routes.Sucursales_routes import crear_sucursal, listar_sucursales, actualizar_sucursal

load_dotenv()
app = Flask(__name__)
app.config.from_object(config)

# Extensiones
CORS(app, resources={r"/*": {"origins": "*"}})
mongo.init_app(app)
bcrypt.init_app(app)
JWTManager(app)


# RUTAS

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    return register_user(data)

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    return login_user(data)

@app.route("/api/pedidos", methods=["POST"])
@jwt_required()
def crear_pedido_route():
    return crear_pedido()

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
if __name__ == "__main__":
    app.run(debug=True, port=5000)
