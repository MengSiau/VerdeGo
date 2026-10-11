import os
from datetime import datetime, timezone

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

Returns a list of rides that are scheduled, have at least one seat free, and are not
owned by the current user. Each ride includes:
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
            .gt("seats_available", 0)
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

'''
POST /api/rides/<ride_id>/request

Passenger requests to join a scheduled ride. Creates a ride_passengers row with status
'requested' - the driver sees it via GET /api/rides/requests and accepts or declines it.
Only once accepted does the passenger actually count toward the ride (see the accept
route below, which decrements seats_available) - that's the only point reflected in
GET /api/rides/mine for the passenger.

Rules:
- The ride must exist, be 'scheduled', and have at least one seat free.
- You can't request your own ride (checked via vehicle ownership).
- Only one ride_passengers row per (ride, passenger) ever exists (DB-enforced via a
  UNIQUE constraint) - requesting again after a previous 'rejected' or 'cancelled'
  response re-opens that same row rather than erroring; requesting again while already
  'requested' or 'accepted' is rejected as a duplicate.

Usage: To be used by the "Request to Join" button on the ride details screen.
'''
@rides_bp.route("/<ride_id>/request", methods=["POST"])
def request_to_join(ride_id):
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        ride_response = (
            supabase
            .table("rides")
            .select("ride_id, vehicle_id, ride_status, seats_available")
            .eq("ride_id", ride_id)
            .maybe_single()
            .execute()
        )

        if not ride_response or not ride_response.data:
            return jsonify({"error": "Ride not found"}), 404

        ride = ride_response.data

        if ride["ride_status"] != "scheduled":
            return jsonify({"error": f"Cannot request a ride that is {ride['ride_status']}"}), 400

        if ride["seats_available"] <= 0:
            return jsonify({"error": "This ride is full"}), 409

        vehicle_response = (
            supabase
            .table("vehicles")
            .select("user_id")
            .eq("vehicle_id", ride["vehicle_id"])
            .maybe_single()
            .execute()
        )

        if vehicle_response and vehicle_response.data and vehicle_response.data["user_id"] == user.id:
            return jsonify({"error": "You can't request to join your own ride"}), 400

        existing_response = (
            supabase
            .table("ride_passengers")
            .select("ride_passenger_id, ride_passenger_status")
            .eq("ride_id", ride_id)
            .eq("passenger_id", user.id)
            .maybe_single()
            .execute()
        )
        existing = existing_response.data if existing_response and existing_response.data else None

        if existing and existing["ride_passenger_status"] in ("requested", "accepted"):
            return jsonify({"error": "You've already requested to join this ride"}), 409

        if existing:
            # Previously rejected/cancelled - let them try again on the same row.
            response = (
                supabase
                .table("ride_passengers")
                .update({"ride_passenger_status": "requested", "responded_at": None})
                .eq("ride_passenger_id", existing["ride_passenger_id"])
                .execute()
            )
        else:
            response = (
                supabase
                .table("ride_passengers")
                .insert({
                    "ride_id": ride_id,
                    "passenger_id": user.id,
                    "ride_passenger_status": "requested",
                })
                .execute()
            )

        return jsonify(response.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
GET /api/rides/requests

Returns every pending ('requested') ride_passengers row across every ride the current
user drives, each with the same {ride, driver, estimate} shape as the other endpoints
plus "passenger" (name, rating, rating_count), "ride_passenger_id", and "requested_at" -
everything the Passenger Requests screen needs to group requests by ride and render them.

Usage: To be used by the Passenger Requests screen.
'''
@rides_bp.route("/requests", methods=["GET"])
def get_requests():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        my_vehicles_response = (
            supabase
            .table("vehicles")
            .select("vehicle_id")
            .eq("user_id", user.id)
            .execute()
        )
        my_vehicle_ids = [v["vehicle_id"] for v in my_vehicles_response.data]

        if not my_vehicle_ids:
            return jsonify([]), 200

        rides_response = (
            supabase
            .table("rides")
            .select("*")
            .in_("vehicle_id", my_vehicle_ids)
            .execute()
        )
        rides_by_id = {r["ride_id"]: r for r in rides_response.data}

        if not rides_by_id:
            return jsonify([]), 200

        requests_response = (
            supabase
            .table("ride_passengers")
            .select("ride_passenger_id, ride_id, passenger_id, requested_at")
            .in_("ride_id", list(rides_by_id.keys()))
            .eq("ride_passenger_status", "requested")
            .execute()
        )
        pending = requests_response.data

        if not pending:
            return jsonify([]), 200

        driver_id = user.id
        passenger_ids = list({p["passenger_id"] for p in pending})

        users_response = (
            supabase
            .table("users")
            .select("user_id, name")
            .in_("user_id", passenger_ids + [driver_id])
            .execute()
        )
        users_by_id = {u["user_id"]: u for u in users_response.data}

        reviews_response = (
            supabase
            .table("reviews")
            .select("reviewee_id, rating")
            .in_("reviewee_id", passenger_ids + [driver_id])
            .execute()
        )
        ratings_by_user_id = {}
        for review in reviews_response.data:
            ratings_by_user_id.setdefault(review["reviewee_id"], []).append(review["rating"])

        def rating_for(user_id):
            ratings = ratings_by_user_id.get(user_id, [])
            avg = sum(ratings) / len(ratings) if ratings else 0
            return avg, len(ratings)

        estimates_response = (
            supabase
            .table("route_estimates")
            .select("*")
            .in_("ride_id", list(rides_by_id.keys()))
            .execute()
        )
        estimates_by_ride_id = {e["ride_id"]: e for e in estimates_response.data}

        driver = users_by_id.get(driver_id, {})
        driver_rating, driver_rating_count = rating_for(driver_id)

        results = []
        for item in pending:
            ride = rides_by_id[item["ride_id"]]
            estimate = estimates_by_ride_id.get(ride["ride_id"], {})
            passenger = users_by_id.get(item["passenger_id"], {})
            passenger_rating, passenger_rating_count = rating_for(item["passenger_id"])

            entry = _serialize_ride(ride, driver, driver_rating, driver_rating_count, estimate)
            entry["ride_passenger_id"] = item["ride_passenger_id"]
            entry["requested_at"] = item["requested_at"]
            entry["passenger"] = {
                "user_id": passenger.get("user_id"),
                "name": passenger.get("name"),
                "rating": passenger_rating,
                "rating_count": passenger_rating_count,
            }
            results.append(entry)

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def _respond_to_request(ride_passenger_id, new_status):
    """Shared accept/decline logic: validates the caller is the ride's driver and the
    request is still pending, then updates its status (and, for accept, the ride's
    seats_available)."""
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        request_response = (
            supabase
            .table("ride_passengers")
            .select("ride_passenger_id, ride_id, ride_passenger_status")
            .eq("ride_passenger_id", ride_passenger_id)
            .maybe_single()
            .execute()
        )

        if not request_response or not request_response.data:
            return jsonify({"error": "Request not found"}), 404

        req = request_response.data

        if req["ride_passenger_status"] != "requested":
            return jsonify({"error": f"This request is already {req['ride_passenger_status']}"}), 400

        ride_response = (
            supabase
            .table("rides")
            .select("ride_id, vehicle_id, seats_available")
            .eq("ride_id", req["ride_id"])
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
            return jsonify({"error": "Only the ride's driver can respond to this request"}), 403

        if new_status == "accepted":
            if ride["seats_available"] <= 0:
                return jsonify({"error": "This ride is full"}), 409

            supabase.table("rides").update(
                {"seats_available": ride["seats_available"] - 1}
            ).eq("ride_id", ride["ride_id"]).execute()

        updated_response = (
            supabase
            .table("ride_passengers")
            .update({
                "ride_passenger_status": new_status,
                "responded_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("ride_passenger_id", ride_passenger_id)
            .execute()
        )

        return jsonify(updated_response.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
PATCH /api/rides/requests/<ride_passenger_id>/accept

Driver accepts a pending passenger request. Only the ride's driver can do this, and only
while the request is still 'requested' and the ride has a free seat. Sets the request to
'accepted' and decrements the ride's seats_available by one - this is the only point at
which a passenger actually counts as "on" the ride (reflected in GET /api/rides/mine).

Usage: To be used by the Accept button on the Passenger Requests screen.
'''
@rides_bp.route("/requests/<ride_passenger_id>/accept", methods=["PATCH"])
def accept_request(ride_passenger_id):
    return _respond_to_request(ride_passenger_id, "accepted")

'''
PATCH /api/rides/requests/<ride_passenger_id>/decline

Driver declines a pending passenger request. Only the ride's driver can do this, and
only while the request is still 'requested'. Sets it to 'rejected' - doesn't touch
seats_available since the passenger was never counted.

Usage: To be used by the Decline button on the Passenger Requests screen.
'''
@rides_bp.route("/requests/<ride_passenger_id>/decline", methods=["PATCH"])
def decline_request(ride_passenger_id):
    return _respond_to_request(ride_passenger_id, "rejected")
