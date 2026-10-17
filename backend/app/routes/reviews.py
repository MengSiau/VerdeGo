import os

from flask import Blueprint, jsonify, request
from supabase import create_client

from app.auth import get_authenticated_user

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")
).schema("dev")

'''
POST /api/reviews

Passenger leaves a review for the driver of a ride they were actually on. Only ever
creates a passenger -> driver review (reviewing a driver you drove with yourself, or any
other direction, isn't a feature yet).

Request body:
- ride_id: the ride being reviewed
- rating: 1-5
- review_text: optional

Rules:
- The ride must exist and be 'completed' - you can't review a ride that's still
  upcoming, got cancelled, or never happened.
- You must have an 'accepted' (or 'completed') ride_passengers row for this ride - you
  can only review rides you actually rode on, not any completed ride in the system.
- One review per (ride, reviewee) per reviewer - enforced by a DB unique constraint, but
  checked here first for a clean 409 instead of a raw DB error. Riding with the same
  driver again on a *different* ride is a fresh review, which the DB allows.

Usage: To be used by the Post Review screen, reached from a passenger's Past rides tile.
'''
@reviews_bp.route("", methods=["POST"])
def create_review():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json()

    if not data or "ride_id" not in data or "rating" not in data:
        return jsonify({"error": "ride_id and rating are required"}), 400

    ride_id = data["ride_id"]
    rating = data["rating"]
    review_text = data.get("review_text")

    if not isinstance(rating, int) or not (1 <= rating <= 5):
        return jsonify({"error": "rating must be an integer between 1 and 5"}), 400

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

        if ride["ride_status"] != "completed":
            return jsonify({"error": "You can only review a completed ride"}), 400

        booking_response = (
            supabase
            .table("ride_passengers")
            .select("ride_passenger_id")
            .eq("ride_id", ride_id)
            .eq("passenger_id", user.id)
            .in_("ride_passenger_status", ["accepted", "completed"])
            .maybe_single()
            .execute()
        )

        if not booking_response or not booking_response.data:
            return jsonify({"error": "You weren't a passenger on this ride"}), 403

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

        if driver_id == user.id:
            return jsonify({"error": "You can't review yourself"}), 400

        existing_response = (
            supabase
            .table("reviews")
            .select("review_id")
            .eq("ride_id", ride_id)
            .eq("reviewer_id", user.id)
            .eq("reviewee_id", driver_id)
            .maybe_single()
            .execute()
        )

        if existing_response and existing_response.data:
            return jsonify({"error": "You've already reviewed this ride"}), 409

        review_response = (
            supabase
            .table("reviews")
            .insert({
                "ride_id": ride_id,
                "reviewer_id": user.id,
                "reviewee_id": driver_id,
                "rating": rating,
                "review_text": review_text,
            })
            .execute()
        )

        return jsonify(review_response.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

'''
GET /api/reviews/me

Returns every review the current user has received (as a reviewee - almost always as a
driver, for now), newest first, with the reviewer's name attached.

Usage: To be used by Profile > "View your reviews".
'''
@reviews_bp.route("/me", methods=["GET"])
def get_my_received_reviews():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Authentication required"}), 401

    try:
        reviews_response = (
            supabase
            .table("reviews")
            .select("review_id, rating, review_text, created_at, reviewer_id")
            .eq("reviewee_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )
        reviews = reviews_response.data

        reviewer_ids = list({r["reviewer_id"] for r in reviews})
        users_by_id = {}
        if reviewer_ids:
            users_response = (
                supabase
                .table("users")
                .select("user_id, name")
                .in_("user_id", reviewer_ids)
                .execute()
            )
            users_by_id = {u["user_id"]: u for u in users_response.data}

        results = [
            {
                "review_id": review["review_id"],
                "rating": review["rating"],
                "review_text": review["review_text"],
                "created_at": review["created_at"],
                "reviewer": {
                    "user_id": review["reviewer_id"],
                    "name": users_by_id.get(review["reviewer_id"], {}).get("name"),
                },
            }
            for review in reviews
        ]

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
