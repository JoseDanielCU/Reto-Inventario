from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from config import config
from models.mongodb import mongo, bcrypt
from dotenv import load_dotenv
# Rutas
from routes.auth_routes import login_user, register_user
from routes.orders_routes import crear_pedido, pedidos_por_sucursal
from routes.products_routes import crear_producto, listar_productos


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
    user = get_jwt_identity()
    data = request.get_json()
    return crear_pedido(user, data)

@app.route("/api/pedidos/sucursal/<sucursal_id>", methods=["GET"])
@jwt_required()
def pedidos_sucursal_route(sucursal_id):
    return pedidos_por_sucursal(sucursal_id)

@app.route("/api/crear_productos", methods=["POST"])
@jwt_required()
def crear_producto_route():
    data = request.get_json()
    return crear_producto(data)

@app.route("/api/lista_productos", methods=["GET"])
@jwt_required()
def listar_productos_route():
    return listar_productos()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
