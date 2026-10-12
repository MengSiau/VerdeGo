import os

from flask import Blueprint, current_app, jsonify, request
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

    # ?mine=true returns the rides this user is driving instead of excluding
    # them. Without it a driver cannot see their own posted ride anywhere in
    # the app, because the browse feed deliberately filters it out.
    mine = request.args.get("mine", "").lower() in ("1", "true", "yes")

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

        # Someone who owns no vehicles cannot be driving anything.
        if mine and not own_vehicle_ids:
            return jsonify([]), 200

        rides_query = (
            supabase
            .table("rides")
            .select("*")
            .eq("ride_status", "scheduled")
        )

        if mine:
            rides_query = rides_query.in_("vehicle_id", own_vehicle_ids)
        elif own_vehicle_ids:
            # not_.in_ with an empty list produces invalid SQL, so only exclude
            # when the user actually owns vehicles. A new user owns none.
            rides_query = rides_query.not_.in_("vehicle_id", own_vehicle_ids)

        # Soonest first - without an explicit order Postgres returns rows in
        # whatever order it finds them, so the feed shuffles between loads.
        rides_response = rides_query.order("departure_time").execute()

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

            vehicle = vehicles_by_id.get(ride["vehicle_id"])

            # A ride whose vehicle has been deleted can't show a driver, so skip
            # it rather than raising a KeyError and failing the whole feed.
            if not vehicle:
                continue

            driver_id = vehicle["user_id"]
            driver = users_by_id.get(driver_id)

            if not driver:
                continue

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

                    # Display labels stored alongside the coordinates. See
                    # database/003_ride_labels.sql.
                    "origin_label": ride.get("origin_label"),
                    "destination_label": ride.get("destination_label"),

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

    except Exception:
        # Logged rather than returned - matching vehicles.py, so database
        # internals don't reach the client. The detail is in the Flask console.
        current_app.logger.exception("Failed to load rides")
        return jsonify({"error": "Unable to load rides"}), 500

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
        # route_estimates has NOT NULL on all three, and every screen that shows
        # a ride reads them. The client already has these from the Routes API
        # and the vehicle's emissions factor, so it sends them rather than the
        # server recomputing.
        "distance_km",
        "duration_min",
        "co2_estimate_kg",
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
        "origin_label": data.get("origin_label"),
        "destination_label": data.get("destination_label"),
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

        ride = response.data[0]

        try:
            (
                supabase
                .table("route_estimates")
                .insert({
                    "ride_id": ride["ride_id"],
                    "distance_km": data["distance_km"],
                    "duration_min": data["duration_min"],
                    "co2_estimate_kg": data["co2_estimate_kg"],
                })
                .execute()
            )
        except Exception:
            # Roll the ride back rather than leaving an orphan with no estimate.
            # A ride with null distance renders as a blank card everywhere, so a
            # failed post is the better outcome.
            (
                supabase
                .table("rides")
                .delete()
                .eq("ride_id", ride["ride_id"])
                .execute()
            )
            raise

        return jsonify(ride), 201

    except Exception:
        current_app.logger.exception("Failed to create ride")
        return jsonify({"error": "Unable to post this ride"}), 400