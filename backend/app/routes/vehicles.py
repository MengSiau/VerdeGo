import os

from flask import Blueprint, current_app, jsonify, request
from supabase import create_client

from app.auth import get_authenticated_user
from app.carbon_sutra import (
    CarbonSutraError, estimate_trip, get_makes, get_models, get_model_with_factor,
)


vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")
).schema("dev")


@vehicles_bp.route("", methods=["GET"])
def get_vehicles():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        response = (
            supabase
            .table("vehicles")
            .select(
                "vehicle_id, license_plate, created_at, model_id, "
                "vehicle_models(make, model, year, co2_g_per_km)"
            )
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )

        return jsonify(response.data), 200

    except Exception:
        return jsonify({"error": "Unable to load vehicles"}), 500


@vehicles_bp.route("/models", methods=["GET"])
def get_vehicle_models():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        make = request.args.get("make")
        if not make:
            return jsonify({"error": "Select a vehicle make first"}), 400
        return jsonify(get_models(supabase, make)), 200

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except CarbonSutraError as error:
        return jsonify({"error": str(error)}), 503

    except Exception:
        current_app.logger.exception("Unable to load vehicle models")
        return jsonify({"error": "Unable to load vehicle models"}), 500


@vehicles_bp.route("/makes", methods=["GET"])
def get_vehicle_makes():
    if not get_authenticated_user():
        return jsonify({"error": "Authentication required"}), 401
    try:
        return jsonify(get_makes(supabase)), 200
    except CarbonSutraError as error:
        current_app.logger.warning("Unable to load CarbonSutra makes: %s", error)
        return jsonify({"error": str(error)}), 503
    except Exception:
        current_app.logger.exception("Unable to load vehicle makes")
        return jsonify({"error": "Unable to load vehicle makes"}), 500


@vehicles_bp.route("/models/<uuid:model_id>/emissions", methods=["POST"])
def get_model_emissions(model_id):
    if not get_authenticated_user():
        return jsonify({"error": "Authentication required"}), 401
    try:
        data = request.get_json(silent=True) or {}
        return jsonify(get_model_with_factor(
            supabase, str(model_id), data.get("year"), data.get("make"), data.get("model")
        )), 200
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except CarbonSutraError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        current_app.logger.exception("Unable to estimate vehicle emissions")
        return jsonify({"error": "Unable to estimate vehicle emissions"}), 500


@vehicles_bp.route("/emissions", methods=["POST"])
def estimate_vehicle_trip():
    if not get_authenticated_user():
        return jsonify({"error": "Authentication required"}), 401
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data.get("model_id"):
        return jsonify({"error": "Model ID and distance_km are required"}), 400
    try:
        return jsonify(estimate_trip(supabase, data["model_id"], data.get("distance_km"))), 200
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except CarbonSutraError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        current_app.logger.exception("Unable to estimate trip emissions")
        return jsonify({"error": "Unable to estimate trip emissions"}), 500


@vehicles_bp.route("", methods=["POST"])
def add_vehicle():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json()

    try:
        vehicle_data = {
            "user_id": user.id,
            "model_id": data["model_id"],
            "license_plate": data["license_plate"],
        }

        response = (
            supabase
            .table("vehicles")
            .insert(vehicle_data)
            .execute()
        )

        return jsonify(response.data[0]), 201

    except Exception:
        current_app.logger.exception("Unable to add vehicle")
        return jsonify({"error": "Unable to add vehicle"}), 400


@vehicles_bp.route("/<vehicle_id>", methods=["PUT"])
def update_vehicle(vehicle_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json()

    try:
        vehicle_data = {
            "model_id": data["model_id"],
            "license_plate": data["license_plate"],
        }

        response = (
            supabase
            .table("vehicles")
            .update(vehicle_data)
            .eq("vehicle_id", vehicle_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Vehicle not found"}), 404

        return jsonify(response.data[0]), 200

    except Exception:
        return jsonify({"error": "Unable to update vehicle"}), 400


@vehicles_bp.route("/<vehicle_id>", methods=["DELETE"])
def delete_vehicle(vehicle_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        response = (
            supabase
            .table("vehicles")
            .delete()
            .eq("vehicle_id", vehicle_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Vehicle not found"}), 404

        return "", 204

    except Exception:
        return jsonify({"error": "Unable to delete vehicle"}), 400
