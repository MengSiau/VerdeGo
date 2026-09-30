import os

from flask import Blueprint, jsonify, request
from supabase import create_client

from app.auth import get_authenticated_user

rides_bp = Blueprint("rides", __name__, url_prefix="/api/rides")

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")
).schema("dev")

@rides_bp.route("", methods=["GET"])
def get_rides():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        # Get vehicles owned by the current user
        user_vehicles_response = (
            supabase
            .table("vehicles")
            .select("vehicle_id")
            .eq("user_id", user.id)
            .execute()
        )

        own_vehicle_ids = [
            vehicle["vehicle_id"]
            for vehicle in user_vehicles_response.data
        ]

        rides_response = (
            supabase
            .table("rides")
            .select("*")
            .eq("ride_status", "scheduled")
            .not_.in_("vehicle_id", own_vehicle_ids)
            .execute()
        )

        estimates_response = (
            supabase
            .table("route_estimates")
            .select("*")
            .execute()
        )

        vehicles_response = (
            supabase
            .table("vehicles")
            .select("*")
            .execute()
        )

        users_response = (
            supabase
            .table("users")
            .select("user_id, name")
            .execute()
        )

        reviews_response = (
            supabase
            .table("reviews")
            .select("reviewee_id, rating")
            .execute()
        )

        estimates_by_ride_id = {
            estimate["ride_id"]: estimate
            for estimate in estimates_response.data
        }

        vehicles_by_id = {
            vehicle["vehicle_id"]: vehicle
            for vehicle in vehicles_response.data
        }

        users_by_id = {
            user["user_id"]: user
            for user in users_response.data
        }

        reviews_by_user_id = {}
        for review in reviews_response.data:
            reviewee_id = review["reviewee_id"]
            
            if reviewee_id not in reviews_by_user_id:
                reviews_by_user_id[reviewee_id] = []
            
            reviews_by_user_id[reviewee_id].append(review["rating"])

        driver_ratings_by_id = {
            user_id: sum(ratings) / len(ratings)
            for user_id, ratings in reviews_by_user_id.items()
        }

        rides = []

        for ride in rides_response.data:
            ride_id = ride["ride_id"]
            estimate = estimates_by_ride_id.get(ride_id, {})

            vehicle = vehicles_by_id[ride["vehicle_id"]]
            
            driver_id = vehicle["user_id"]
            driver = users_by_id[driver_id]
            
            driver_rating = driver_ratings_by_id.get(driver_id, 0)
            driver_rating_count = len(reviews_by_user_id.get(driver_id, []))

            rides.append({
                "ride": {
                    "ride_id": ride["ride_id"],
                    "vehicle_id": ride["vehicle_id"],
                    "ride_status": ride["ride_status"],
                    
                    "origin": {
                        "lat": ride["origin_lat"],
                        "lng": ride["origin_lng"],
                    },

                    "destination": {
                        "lat": ride["destination_lat"],
                        "lng": ride["destination_lng"],
                    },

                    "departure_time": ride["departure_time"],
                    "price_per_passenger": ride["price_per_passenger"],
                    "seats_available": ride["seats_available"],
                    "created_at": ride["created_at"]
                },

                "driver": {
                    "user_id": driver.get("user_id"),
                    "name": driver.get("name"),
                    "rating": driver_rating,
                    "rating_count": driver_rating_count,
                },
                
                "estimate": {
                    "distance_km": estimate.get("distance_km"),
                    "duration_min": estimate.get("duration_min"),
                    "co2_estimate_kg": estimate.get("co2_estimate_kg"),
                },
            })

        return jsonify(rides), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rides_bp.route("", methods=["POST"])
def create_ride():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required_fields = [
        "vehicle_id",
        "origin_lat",
        "origin_lng",
        "destination_lat",
        "destination_lng",
        "departure_time",
        "price_per_passenger",
        "seats_available",
    ]

    missing_fields = [
        field for field in required_fields
        if field not in data
    ]

    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing_fields
        }), 400

    # Check that the vehicle belongs to the authenticated user.
    vehicle_response = (
        supabase
        .table("vehicles")
        .select("vehicle_id")
        .eq("vehicle_id", data["vehicle_id"])
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )

    if not vehicle_response.data:
        return jsonify({
            "error": "Vehicle not found or does not belong to the current user"
        }), 403

    ride_data = {
        "vehicle_id": data["vehicle_id"],
        "origin_lat": data["origin_lat"],
        "origin_lng": data["origin_lng"],
        "destination_lat": data["destination_lat"],
        "destination_lng": data["destination_lng"],
        "departure_time": data["departure_time"],
        "price_per_passenger": data["price_per_passenger"],
        "seats_available": data["seats_available"],
    }

    try:
        response = (
            supabase
            .table("rides")
            .insert(ride_data)
            .execute()
        )

        return jsonify(response.data[0]), 201

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400
