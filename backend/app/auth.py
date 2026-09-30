import os

from flask import request
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY"),
)


def get_authenticated_user():
    """Return the Supabase user for the current request, or None."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    scheme, _, token = auth_header.partition(" ")

    if scheme.lower() != "bearer" or not token:
        return None

    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception:
        return None