from flask import Flask
from flask_cors import CORS

from app.routes.users import users_bp
from app.routes.rides import rides_bp
from app.routes.vehicles import vehicles_bp

def create_app():
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(users_bp)
    app.register_blueprint(rides_bp)
    app.register_blueprint(vehicles_bp)

    return app