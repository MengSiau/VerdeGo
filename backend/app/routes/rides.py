import os

from flask import Blueprint, jsonify, request
from supabase import create_client

from app.auth import get_authenticated_user

rides_bp = Blueprint("rides", __name__, url_prefix="/api/rides")

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")
).schema("dev")


def _serialize_ride(ride, driver, driver_rating, driver_rating_count, estimate):
    """Builds the {ride, driver, estimate} shape shared by the list and detail endpoints."""
    return {
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
    }

'''
GET /api/rides

Returns a list of rides that are scheduled and not owned by the current user.
Each ride includes:
- Ride details (origin, destination, departure time, price, seats available)
- Driver details (name, rating, rating count)

Usage: To be used in the mainfeed (the home page). 
'''
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

            rides.append(_serialize_ride(ride, driver, driver_rating, driver_rating_count, estimate))

        return jsonify(rides), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
GET /api/rides/mine

Returns every ride the current user is involved in, as either a driver (rides on a
vehicle they own, excluding ones they've cancelled) or a passenger (ride_passengers rows
with status 'accepted' or 'completed' - not 'requested', 'rejected' or 'cancelled', since
those aren't a real booking). Each entry has the same {ride, driver, estimate} shape as
the other endpoints, plus "role" ("driver" | "passenger") so the client doesn't have to
re-derive it, and "passenger_status" on passenger-side entries.

A cancelled ride (see PATCH /<ride_id>/cancel) drops off both sides automatically: the
driver query excludes ride_status 'cancelled' directly, and cancelling also flips every
live ride_passengers row to 'cancelled', which falls out of the passenger query's
accepted/completed filter.

Note: registered before /<ride_id> in this file, but Werkzeug matches literal path
segments before variable ones regardless of declaration order, so "/mine" will never be
swallowed as a ride_id lookup.

Usage: To be used by the My Rides screen.
'''
@rides_bp.route("/mine", methods=["GET"])
def get_my_rides():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        # Driver side: rides on any vehicle I own.
        my_vehicles_response = (
            supabase
            .table("vehicles")
            .select("vehicle_id")
            .eq("user_id", user.id)
            .execute()
        )
        my_vehicle_ids = [v["vehicle_id"] for v in my_vehicles_response.data]

        driver_rides = []
        if my_vehicle_ids:
            driver_rides_response = (
                supabase
                .table("rides")
                .select("*")
                .in_("vehicle_id", my_vehicle_ids)
                .neq("ride_status", "cancelled")
                .execute()
            )
            driver_rides = driver_rides_response.data

        # Passenger side: rides I've been accepted onto (or completed).
        my_passenger_rows_response = (
            supabase
            .table("ride_passengers")
            .select("ride_id, ride_passenger_status")
            .eq("passenger_id", user.id)
            .in_("ride_passenger_status", ["accepted", "completed"])
            .execute()
        )
        my_passenger_rows = my_passenger_rows_response.data
        passenger_status_by_ride_id = {
            row["ride_id"]: row["ride_passenger_status"]
            for row in my_passenger_rows
        }
        passenger_ride_ids = list(passenger_status_by_ride_id.keys())

        passenger_rides = []
        if passenger_ride_ids:
            passenger_rides_response = (
                supabase
                .table("rides")
                .select("*")
                .in_("ride_id", passenger_ride_ids)
                .execute()
            )
            passenger_rides = passenger_rides_response.data

        all_rides = driver_rides + passenger_rides
        all_ride_ids = [ride["ride_id"] for ride in all_rides]
        all_vehicle_ids = list({ride["vehicle_id"] for ride in all_rides})

        vehicles_by_id = {}
        if all_vehicle_ids:
            vehicles_response = (
                supabase
                .table("vehicles")
                .select("*")
                .in_("vehicle_id", all_vehicle_ids)
                .execute()
            )
            vehicles_by_id = {v["vehicle_id"]: v for v in vehicles_response.data}

        driver_ids = list({v["user_id"] for v in vehicles_by_id.values()})

        users_by_id = {}
        reviews_by_user_id = {}
        if driver_ids:
            users_response = (
                supabase
                .table("users")
                .select("user_id, name")
                .in_("user_id", driver_ids)
                .execute()
            )
            users_by_id = {u["user_id"]: u for u in users_response.data}

            reviews_response = (
                supabase
                .table("reviews")
                .select("reviewee_id, rating")
                .in_("reviewee_id", driver_ids)
                .execute()
            )
            for review in reviews_response.data:
                reviews_by_user_id.setdefault(review["reviewee_id"], []).append(review["rating"])

        estimates_by_ride_id = {}
        if all_ride_ids:
            estimates_response = (
                supabase
                .table("route_estimates")
                .select("*")
                .in_("ride_id", all_ride_ids)
                .execute()
            )
            estimates_by_ride_id = {e["ride_id"]: e for e in estimates_response.data}

        def build_entry(ride, role, passenger_status=None):
            vehicle = vehicles_by_id.get(ride["vehicle_id"], {})
            driver_id = vehicle.get("user_id")
            driver = users_by_id.get(driver_id, {})
            ratings = reviews_by_user_id.get(driver_id, [])
            driver_rating = sum(ratings) / len(ratings) if ratings else 0
            driver_rating_count = len(ratings)
            estimate = estimates_by_ride_id.get(ride["ride_id"], {})

            entry = _serialize_ride(ride, driver, driver_rating, driver_rating_count, estimate)
            entry["role"] = role
            if passenger_status:
                entry["passenger_status"] = passenger_status
            return entry

        results = [build_entry(ride, "driver") for ride in driver_rides]
        results += [
            build_entry(ride, "passenger", passenger_status_by_ride_id.get(ride["ride_id"]))
            for ride in passenger_rides
        ]

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
GET /api/rides/<ride_id>

Returns a single ride by id, in the same {ride, driver, estimate} shape as the list
endpoint. Unlike the list, this isn't filtered to "scheduled and not mine" - once you
have a ride's id (e.g. from the feed, or your own posting), you can look it up directly.

Usage: To be used by the ride details screen.
'''
@rides_bp.route("/<ride_id>", methods=["GET"])
def get_ride(ride_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        ride_response = (
            supabase
            .table("rides")
            .select("*")
            .eq("ride_id", ride_id)
            .maybe_single()
            .execute()
        )

        # .maybe_single() returns None itself (not an object with .data=None) when no row
        # matches, so every call here needs an existence check before touching .data.
        if not ride_response or not ride_response.data:
            return jsonify({"error": "Ride not found"}), 404

        ride = ride_response.data

        vehicle_response = (
            supabase
            .table("vehicles")
            .select("user_id")
            .eq("vehicle_id", ride["vehicle_id"])
            .maybe_single()
            .execute()
        )

        if not vehicle_response or not vehicle_response.data:
            return jsonify({"error": "Ride not found"}), 404

        driver_id = vehicle_response.data["user_id"]

        driver_response = (
            supabase
            .table("users")
            .select("user_id, name")
            .eq("user_id", driver_id)
            .maybe_single()
            .execute()
        )

        driver = driver_response.data if driver_response and driver_response.data else {}

        estimate_response = (
            supabase
            .table("route_estimates")
            .select("*")
            .eq("ride_id", ride_id)
            .maybe_single()
            .execute()
        )

        # A ride posted without a route estimate yet (e.g. created before that was wired
        # up) should still return - just with nulls for distance/duration/CO2.
        estimate = estimate_response.data if estimate_response and estimate_response.data else {}

        reviews_response = (
            supabase
            .table("reviews")
            .select("rating")
            .eq("reviewee_id", driver_id)
            .execute()
        )

        ratings = [review["rating"] for review in reviews_response.data]
        driver_rating = sum(ratings) / len(ratings) if ratings else 0
        driver_rating_count = len(ratings)

        return jsonify(_serialize_ride(ride, driver, driver_rating, driver_rating_count, estimate)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
PATCH /api/rides/<ride_id>/cancel

Cancels a scheduled ride. Only the ride's driver (the owner of its vehicle) can cancel
it - anyone else gets a 403. Only a 'scheduled' ride can be cancelled; an ongoing,
completed, or already-cancelled ride returns a 400.

Also flips every live ride_passengers row ('requested' or 'accepted') on this ride to
'cancelled', so it drops out of every passenger's GET /api/rides/mine too, not just the
driver's. The main feed (GET /api/rides) already only lists 'scheduled' rides, so a
cancelled ride disappears from there for free.

Usage: To be used by the "Cancel Ride" action on My Ride Details.
'''
@rides_bp.route("/<ride_id>/cancel", methods=["PATCH"])
def cancel_ride(ride_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        ride_response = (
            supabase
            .table("rides")
            .select("ride_id, vehicle_id, ride_status")
            .eq("ride_id", ride_id)
            .maybe_single()
            .execute()
        )

        if not ride_response or not ride_response.data:
            return jsonify({"error": "Ride not found"}), 404

        ride = ride_response.data

        vehicle_response = (
            supabase
            .table("vehicles")
            .select("user_id")
            .eq("vehicle_id", ride["vehicle_id"])
            .maybe_single()
            .execute()
        )

        if not vehicle_response or not vehicle_response.data or vehicle_response.data["user_id"] != user.id:
            return jsonify({"error": "Only the ride's driver can cancel it"}), 403

        if ride["ride_status"] != "scheduled":
            return jsonify({"error": f"Cannot cancel a ride that is {ride['ride_status']}"}), 400

        updated_response = (
            supabase
            .table("rides")
            .update({"ride_status": "cancelled"})
            .eq("ride_id", ride_id)
            .execute()
        )

        (
            supabase
            .table("ride_passengers")
            .update({"ride_passenger_status": "cancelled"})
            .eq("ride_id", ride_id)
            .in_("ride_passenger_status", ["requested", "accepted"])
            .execute()
        )

        return jsonify(updated_response.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
POST /api/rides
Creates a new ride for the authenticated user.
Request body should include:
- vehicle_id: ID of the vehicle to be used for the ride
- origin_lat: Latitude of the origin
- origin_lng: Longitude of the origin
- destination_lat: Latitude of the destination
- destination_lng: Longitude of the destination
- departure_time: Scheduled departure time (ISO 8601 format)
- price_per_passenger: Price per passenger for the ride
- seats_available: Number of available seats for the ride

Optionally, if the client already has a real route estimate for this journey (e.g. from
a routing API), it can also include all three of:
- distance_km: Journey distance in km
- duration_min: Journey duration in minutes
- co2_estimate_kg: Estimated total trip CO2 in kg
These are persisted as the ride's route_estimates row. All three must be present together
(the table requires it) - a partial set is ignored and the estimate is simply left null.

Returns the created ride details on success.

Usage: To be used when a user wants to create a new ride offer.
'''

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

    # .maybe_single() returns None itself (not an object with .data=None) when no vehicle
    # matches both filters, so check for that before touching .data.
    if not vehicle_response or not vehicle_response.data:
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

        ride = response.data[0]

        # Optional: the client may already have a real distance/duration/CO2 for this
        # journey (e.g. from a routing API) - persist it as the ride's route estimate so
        # it doesn't just get thrown away. route_estimates requires all three together,
        # so only insert if the caller sent the complete set.
        estimate_fields = ("distance_km", "duration_min", "co2_estimate_kg")
        if all(field in data for field in estimate_fields):
            try:
                supabase.table("route_estimates").insert({
                    "ride_id": ride["ride_id"],
                    "distance_km": data["distance_km"],
                    "duration_min": data["duration_min"],
                    "co2_estimate_kg": data["co2_estimate_kg"],
                }).execute()
            except Exception:
                # The ride itself was created successfully - a failed estimate insert
                # shouldn't fail the whole request, it just leaves the estimate null.
                pass

        return jsonify(ride), 201

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400
