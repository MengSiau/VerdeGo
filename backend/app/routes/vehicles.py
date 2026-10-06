import os

from flask import Blueprint, jsonify, request
from supabase import create_client

from app.auth import get_authenticated_user


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
        response = (
            supabase
            .table("vehicle_models")
            .select("model_id, make, model, year, co2_g_per_km")
            .order("make")
            .order("model")
            .order("year", desc=True)
            .execute()
        )

        return jsonify(response.data), 200

    except Exception:
        return jsonify({"error": "Unable to load vehicle models"}), 500


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
