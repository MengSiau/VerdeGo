"""CarbonSutra catalogue and selected-model cache using the existing schema.

Catalogue lists are cached in memory. Selected make/model/year combinations
are persisted in vehicle_models. CarbonSutra factors are averaged over years.
"""
import json
import math
import os
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from threading import RLock
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from uuid import NAMESPACE_URL, uuid5

BASE_URL = "https://api.carbonsutra.com/api/v1"
REFERENCE_DISTANCE_KM = 100
MODEL_FIELDS = "model_id, make, model, year, co2_g_per_km"
PAGE_SIZE = 1000
_cache_lock = RLock()
_makes = None
_models_by_make = {}
_models_by_id = {}
_factors_by_model = {}
_refreshed_ids = set()


class CarbonSutraError(Exception):
    pass


def _request(path, payload=None):
    key = os.getenv("CARBONSUTRA_API_KEY", "").strip()
    if not key:
        raise CarbonSutraError("CarbonSutra API key is not configured")
    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }
    # CarbonSutra's direct API takes estimate parameters in the query string.
    query = f"?{urlencode(payload)}" if payload is not None else ""
    request = Request(
        f"{BASE_URL}/{path}{query}",
        data=b"" if payload is not None else None,
        headers=headers, method="POST" if payload is not None else "GET",
    )
    try:
        with urlopen(request, timeout=25) as response:
            result = json.load(response)
        if isinstance(result, dict) and result.get("success") is False:
            raise CarbonSutraError("CarbonSutra could not complete this request")
        return result
    except HTTPError as error:
        messages = {
            401: "CarbonSutra credentials were rejected",
            403: "CarbonSutra access denied; check your CarbonSutra API key and account access",
            429: "CarbonSutra request quota reached; try again later",
        }
        raise CarbonSutraError(messages.get(error.code, f"CarbonSutra returned status {error.code}")) from None
    except (URLError, TimeoutError, ValueError):
        raise CarbonSutraError("Unable to contact CarbonSutra") from None


def _names(response, kind):
    """Normalize catalogue arrays and the provider's JSON data envelope."""
    data = response.get("data", response) if isinstance(response, dict) else response
    if isinstance(data, dict):
        for key in (f"vehicle_{kind}s", f"{kind}s", f"vehicle_{kind}"):
            if key in data:
                data = data[key]
                break
    if isinstance(data, dict) and all(isinstance(value, (int, float)) for value in data.values()):
        data = list(data)
    if not isinstance(data, list):
        raise CarbonSutraError(f"CarbonSutra returned an unexpected {kind} catalogue")
    names = []
    for item in data:
        if isinstance(item, dict):
            item = item.get(f"vehicle_{kind}", item.get(kind, item.get("name")))
        if not isinstance(item, str) or not item.strip():
            raise CarbonSutraError(f"CarbonSutra returned an invalid {kind} name")
        names.append(item.strip())
    return sorted(set(names), key=str.casefold)


def _model_id(make, model, year=None):
    # Stable local IDs; CarbonSutra identifies cars by names, not provider UUIDs.
    return str(uuid5(NAMESPACE_URL, json.dumps(["carbonsutra", make, model, year])))


def _saved_models(db, make_name):
    """Read saved models for one make, including all database pages."""
    rows = []
    offset = 0
    while True:
        page = (
            db.table("vehicle_models").select(MODEL_FIELDS).eq("make", make_name)
            .order("year", desc=True).order("model").order("model_id")
            .range(offset, offset + PAGE_SIZE - 1).execute().data
        )
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE


def get_makes(db):
    global _makes
    with _cache_lock:
        if _makes is None:
            _makes = [{"make_id": str(uuid5(NAMESPACE_URL, "carbonsutra/make/" + name)), "name": name}
                      for name in _names(_request("vehicle_makes"), "make")]
        return [dict(make) for make in _makes]


def get_models(db, make_name):
    with _cache_lock:
        if not any(make["name"] == make_name for make in get_makes(db)):
            raise ValueError("Vehicle make not found")
        if make_name not in _models_by_make:
            names = _names(_request(f"vehicle_makes/{quote(make_name, safe='')}/vehicle_models"), "model")
            models = [{"model_id": _model_id(make_name, name), "make": make_name,
                       "model": name, "year": None, "co2_g_per_km": None} for name in names]
            _models_by_make[make_name] = models
            _models_by_id.update({model["model_id"]: model for model in models})
        # Read existing rows for the selected make, but year is selected separately.
        # Include saved models absent from the provider list to allow editing them.
        combined = {row["model"]: dict(row) for row in _models_by_make[make_name]}
        for saved in _saved_models(db, make_name):
            if saved["model"] not in combined:
                catalogue = {**saved, "model_id": _model_id(make_name, saved["model"]), "year": None, "co2_g_per_km": None}
                combined[saved["model"]] = catalogue
                _models_by_id[catalogue["model_id"]] = catalogue
        return sorted(combined.values(), key=lambda model: model["model"].casefold())


def _saved_identity(db, model):
    rows = (db.table("vehicle_models").select(MODEL_FIELDS)
            .eq("make", model["make"]).eq("model", model["model"]).eq("year", model["year"]).execute().data)
    return rows[0] if rows else None


def _factor(db, make, model):
    identity = (make, model)
    if identity in _factors_by_model:
        return _factors_by_model[identity]
    # Only reuse rows with IDs generated for this provider. Other saved factors
    # are refreshed on selection rather than presented as CarbonSutra results.
    for row in _saved_models(db, make):
        if row["model"] == model and (row["model_id"] == _model_id(make, model, row["year"]) or row["model_id"] in _refreshed_ids):
            _factors_by_model[identity] = row["co2_g_per_km"]
            return row["co2_g_per_km"]
    estimate = _request("vehicle_estimate_by_model", {
        "vehicle_make": make, "vehicle_model": model,
        "distance_unit": "km", "distance_value": REFERENCE_DISTANCE_KM,
    })
    try:
        factor = Decimal(str(estimate["data"]["co2e_gm"])) / REFERENCE_DISTANCE_KM
        if not factor.is_finite() or factor < 0:
            raise ValueError
        factor = float(factor.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    except (KeyError, TypeError, ValueError, ArithmeticError):
        raise CarbonSutraError("CarbonSutra returned an invalid emissions estimate") from None
    _factors_by_model[identity] = factor
    return factor


def get_model_with_factor(db, model_id, year=None, make_name=None, model_name=None):
    with _cache_lock:
        rows = db.table("vehicle_models").select(MODEL_FIELDS).eq("model_id", model_id).execute().data
        catalogue = rows[0] if rows else _models_by_id.get(model_id)
        if catalogue is None and make_name and model_name:
            # Rebuild a catalogue after restart before accepting a selection.
            catalogue = next((item for item in get_models(db, make_name)
                              if item["model_id"] == model_id and item["model"] == model_name), None)
        if catalogue is None:
            raise LookupError("Vehicle model not found; reload the model list")
        if year is None:
            year = catalogue["year"]
        if isinstance(year, bool) or not isinstance(year, int) or not 1886 <= year <= datetime.now().year + 1:
            raise ValueError("Select a valid vehicle year")
        model = {"model_id": _model_id(catalogue["make"], catalogue["model"], year),
                 "make": catalogue["make"], "model": catalogue["model"], "year": year,
                 "co2_g_per_km": _factor(db, catalogue["make"], catalogue["model"])}
        saved = _saved_identity(db, model)
        if saved:
            if saved["co2_g_per_km"] != model["co2_g_per_km"]:
                db.table("vehicle_models").update({"co2_g_per_km": model["co2_g_per_km"]}).eq("model_id", saved["model_id"]).execute()
            _refreshed_ids.add(saved["model_id"])
            return {**saved, "co2_g_per_km": model["co2_g_per_km"]}
        db.table("vehicle_models").upsert(model, on_conflict="make,model,year", ignore_duplicates=True).execute()
        saved = _saved_identity(db, model)
        _refreshed_ids.add(saved["model_id"])
        return saved


def estimate_trip(db, model_id, distance_km):
    if isinstance(distance_km, bool) or not isinstance(distance_km, (int, float)):
        raise ValueError("Distance must be a number in kilometres")
    if not math.isfinite(distance_km) or distance_km < 0:
        raise ValueError("Distance must be a finite, non-negative number")
    model = get_model_with_factor(db, model_id)
    carbon_g = round(float(model["co2_g_per_km"]) * distance_km, 2)
    return {
        "model_id": model["model_id"], "distance_km": distance_km,
        "co2_g_per_km": model["co2_g_per_km"],
        "carbon_g": carbon_g, "carbon_kg": carbon_g / 1000,
    }
