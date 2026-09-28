from flask import Blueprint, jsonify, request
from supabase import create_client
import os


users_bp = Blueprint("users", __name__, url_prefix="/api/users")


# ============================================================
# Supabase client
# ============================================================

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
)

# ============================================================
# Helper functions
# ============================================================

def get_authenticated_user():
    """
    Get the currently authenticated Supabase user from the
    Authorization header.

    Returns:
        Supabase user object if authenticated, otherwise None.
    """

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]

    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception:
        return None


@users_bp.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "API is working!"})


# ============================================================
# Get current user's profile
# ============================================================
 
@users_bp.route("/me", methods=["GET"])
def get_current_user():
    """
    GET /api/users/me

    Returns the profile of the currently authenticated user.
    """

    user = get_authenticated_user()

    if user is None:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    response = (
        supabase
        .schema("dev")
        .table("users")
        .select("user_id, name, created_at")
        .eq("user_id", user.id)
        .single()
        .execute()
    )

    if not response.data:
        return jsonify({
            "error": "User profile not found"
        }), 404

    return jsonify(response.data), 200


# ============================================================
# Update current user's profile
# ============================================================

@users_bp.route("/me", methods=["PUT"])
def update_current_user():
    """
    PUT /api/users/me

    Updates the currently authenticated user's profile.
    """

    user = get_authenticated_user()

    if user is None:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")

    if name is None:
        return jsonify({
            "error": "Name is required"
        }), 400

    name = name.strip()

    if not name:
        return jsonify({
            "error": "Name cannot be empty"
        }), 400

    response = (
        supabase
        .schema("dev")
        .table("users")
        .update({
            "name": name
        })
        .eq("user_id", user.id)
        .execute()
    )

    if not response.data:
        return jsonify({
            "error": "User profile not found"
        }), 404

    return jsonify(response.data[0]), 200
