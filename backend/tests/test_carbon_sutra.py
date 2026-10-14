"""Run with python -m unittest discover -s tests (no live API/database calls)."""
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from io import BytesIO
from urllib.parse import parse_qs, urlsplit


spec = importlib.util.spec_from_file_location(
    "carbon_sutra", Path(__file__).parents[1] / "app" / "carbon_sutra.py"
)
carbon = importlib.util.module_from_spec(spec)
spec.loader.exec_module(carbon)


class Query:
    def __init__(self, db, table):
        self.db, self.table = db, table
        self.filters, self.orders = [], []
        self.operation, self.payload, self.bounds = "select", None, None

    def select(self, fields):
        return self

    def eq(self, field, value):
        self.filters.append((field, value))
        return self

    def order(self, field, desc=False):
        self.orders.append((field, desc))
        return self

    def range(self, start, end):
        self.bounds = (start, end)
        return self

    def update(self, payload):
        self.operation, self.payload = "update", payload
        return self

    def upsert(self, payload, on_conflict, ignore_duplicates=False):
        self.operation, self.payload = "upsert", payload
        self.conflict, self.ignore = on_conflict, ignore_duplicates
        return self

    def execute(self):
        table = self.db.tables.setdefault(self.table, [])
        rows = [row for row in table if all(row.get(key) == value for key, value in self.filters)]
        if self.operation == "update":
            for row in rows:
                row.update(self.payload)
        elif self.operation == "upsert":
            for item in (self.payload if isinstance(self.payload, list) else [self.payload]):
                fields = self.conflict.split(',')
                existing = next((row for row in table if all(row[field] == item[field] for field in fields)), None)
                if existing is None:
                    table.append(dict(item))
                elif not self.ignore:
                    existing.update(item)
            rows = table
        else:
            for key, desc in reversed(self.orders):
                rows = sorted(rows, key=lambda row: row[key], reverse=desc)
            if self.bounds:
                start, end = self.bounds
                rows = rows[start:end + 1]
        return SimpleNamespace(data=[dict(row) for row in rows])


class Database:
    def __init__(self, **tables):
        self.tables = tables

    def table(self, name):
        return Query(self, name)


def provider_item(id, **attributes):
    return {"data": {"id": id, "attributes": attributes}}


class CarbonSutraTests(unittest.TestCase):
    def setUp(self):
        carbon._makes = None
        carbon._models_by_make.clear()
        carbon._models_by_id.clear()
        carbon._factors_by_model.clear()
        carbon._refreshed_ids.clear()

    def model(self, year=2020, factor=123.45):
        return {"model_id": carbon._model_id("Toyota", "Corolla", year), "make": "Toyota",
                "model": "Corolla", "year": year, "co2_g_per_km": factor}

    def catalogue(self):
        model = self.model(None, None)
        carbon._models_by_id[model["model_id"]] = model
        return model

    def test_makes_are_cached_without_database_writes(self):
        db = Database()
        with patch.object(carbon, "_request", return_value={"data": ["Toyota", "Honda"]}) as request:
            self.assertEqual([row["name"] for row in carbon.get_makes(db)], ["Honda", "Toyota"])
            carbon.get_makes(db)
            request.assert_called_once_with("vehicle_makes")
        self.assertEqual(db.tables, {})

    def test_catalogue_response_shapes(self):
        self.assertEqual(carbon._names({"data": {"vehicle_makes": [{"vehicle_make": "Toyota"}]}}, "make"), ["Toyota"])
        self.assertEqual(carbon._names({"data": {"Corolla": 4}}, "model"), ["Corolla"])
        with self.assertRaises(carbon.CarbonSutraError):
            carbon._names({"message": "Invalid key"}, "make")

    def test_models_cache_is_make_specific_without_inserting_rows(self):
        carbon._makes = [{"make_id": "toyota", "name": "Toyota"}, {"make_id": "honda", "name": "Honda"}]
        db = Database()
        with patch.object(carbon, "_request", side_effect=[{"data": ["Yaris", "Corolla"]}, {"data": ["Civic"]}]) as request:
            self.assertEqual([row["model"] for row in carbon.get_models(db, "Toyota")], ["Corolla", "Yaris"])
            self.assertEqual([row["model"] for row in carbon.get_models(db, "Honda")], ["Civic"])
            carbon.get_models(db, "Toyota")
            self.assertEqual(request.call_count, 2)
        self.assertEqual(db.tables["vehicle_models"], [])

    def test_first_selection_saves_original_columns_and_reuses_factor_after_restart(self):
        db = Database()
        catalogue = self.catalogue()
        with patch.object(carbon, "_request", return_value={"data": {"co2e_gm": 12345}}) as request:
            model = carbon.get_model_with_factor(db, catalogue["model_id"], 2020)
            self.assertEqual(model, self.model())
            self.setUp()
            self.assertEqual(carbon.estimate_trip(db, model["model_id"], 20)["carbon_kg"], 2.469)
            request.assert_called_once_with("vehicle_estimate_by_model", {
                "vehicle_make": "Toyota", "vehicle_model": "Corolla", "distance_unit": "km", "distance_value": 100,
            })
        self.assertEqual(set(model), {"model_id", "make", "model", "year", "co2_g_per_km"})

    def test_years_have_different_saved_ids_but_share_one_factor_request(self):
        db = Database()
        catalogue = self.catalogue()
        with patch.object(carbon, "_request", return_value={"data": {"co2e_gm": 12345}}) as request:
            first = carbon.get_model_with_factor(db, catalogue["model_id"], 2020)
            second = carbon.get_model_with_factor(db, catalogue["model_id"], 2021)
            self.assertNotEqual(first["model_id"], second["model_id"])
            self.assertEqual(first["co2_g_per_km"], second["co2_g_per_km"])
            self.assertEqual(request.call_count, 1)

    def test_legacy_id_is_preserved_and_factor_is_refreshed(self):
        saved = {**self.model(), "model_id": "legacy", "co2_g_per_km": 999}
        db = Database(vehicle_models=[saved])
        with patch.object(carbon, "_request", return_value={"data": {"co2e_gm": 12345}}):
            refreshed = carbon.get_model_with_factor(db, "legacy")
        self.assertEqual(refreshed["model_id"], "legacy")
        self.assertEqual(db.tables["vehicle_models"][0]["co2_g_per_km"], 123.45)

    def test_zero_factor_is_a_cache_hit(self):
        saved = self.model(factor=0)
        db = Database(vehicle_models=[saved])
        with patch.object(carbon, "_request") as request:
            self.assertEqual(carbon.estimate_trip(db, saved["model_id"], 100)["carbon_g"], 0)
            request.assert_not_called()

    def test_failed_or_invalid_estimate_does_not_insert_row(self):
        for result in ({"data": {}}, {"data": {"co2e_gm": -1}}, {"data": {"co2e_gm": "NaN"}}):
            db = Database()
            catalogue = self.catalogue()
            with patch.object(carbon, "_request", return_value=result):
                with self.assertRaises(carbon.CarbonSutraError):
                    carbon.get_model_with_factor(db, catalogue["model_id"], 2020)
            self.assertEqual(db.tables["vehicle_models"], [])

    def test_invalid_year_and_distance_do_not_call_provider(self):
        catalogue = self.catalogue()
        with patch.object(carbon, "_request") as request:
            for year in (None, 1800, True, "2020"):
                with self.assertRaises(ValueError):
                    carbon.get_model_with_factor(Database(), catalogue["model_id"], year)
            for distance in (-1, float("nan"), float("inf"), True, "10", None):
                with self.assertRaises(ValueError):
                    carbon.estimate_trip(Database(), "one", distance)
            request.assert_not_called()

    def test_unknown_model_requires_reload(self):
        with patch.object(carbon, "_request") as request:
            with self.assertRaises(LookupError):
                carbon.get_model_with_factor(Database(), "unknown", 2020)
            request.assert_not_called()

    def test_request_uses_direct_api_bearer_and_query_parameters(self):
        captured = []
        def open_request(request, timeout):
            captured.append(request)
            return BytesIO(b'{"data": {"co2e_gm": 12345}, "success": true}')
        with patch.dict(carbon.os.environ, {"CARBONSUTRA_API_KEY": "test-only"}), patch.object(carbon, "urlopen", side_effect=open_request):
            carbon._request("vehicle_estimate_by_model", {"vehicle_make": "Land Rover", "vehicle_model": "Range Rover", "distance_unit": "km"})
        request = captured[0]
        self.assertEqual(urlsplit(request.full_url).netloc, "api.carbonsutra.com")
        self.assertEqual(urlsplit(request.full_url).path, "/api/v1/vehicle_estimate_by_model")
        self.assertEqual(request.method, "POST")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-only")
        self.assertIsNone(request.get_header("X-rapidapi-key"))
        self.assertEqual(parse_qs(urlsplit(request.full_url).query)["vehicle_make"], ["Land Rover"])


if __name__ == "__main__":
    unittest.main()
