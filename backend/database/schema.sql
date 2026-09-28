BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS dev;

-- ============================================================
-- Drop existing tables
-- ============================================================
DROP TABLE IF EXISTS dev.reports;
DROP TABLE IF EXISTS dev.reviews;
DROP TABLE IF EXISTS dev.route_estimates;
DROP TABLE IF EXISTS dev.ride_stops;
DROP TABLE IF EXISTS dev.ride_passengers;
DROP TABLE IF EXISTS dev.rides;
DROP TABLE IF EXISTS dev.vehicles;
DROP TABLE IF EXISTS dev.users;
DROP TABLE IF EXISTS dev.vehicle_models;


-- ============================================================
-- Vehicle models
-- ============================================================
CREATE TABLE dev.vehicle_models (
    model_id UUID DEFAULT gen_random_uuid(),
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year SMALLINT NOT NULL,
    co2_g_per_km NUMERIC(6, 2) NOT NULL,
    PRIMARY KEY (model_id),
    UNIQUE (make, model, year)
);


-- ============================================================
-- Users
-- ============================================================
CREATE TABLE dev.users (
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);


-- ============================================================
-- Create dev.users profile when a new Auth user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION dev.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO dev.users (user_id, name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            ''
        )
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION dev.handle_new_user();


-- ============================================================
-- Vehicles
-- ============================================================
CREATE TABLE dev.vehicles (
    vehicle_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    model_id UUID NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (vehicle_id),
    UNIQUE (license_plate),
    FOREIGN KEY (user_id) REFERENCES dev.users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES dev.vehicle_models(model_id)
);


-- ============================================================
-- Rides
-- ============================================================
CREATE TABLE dev.rides (
    ride_id UUID DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    ride_status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    origin_lat NUMERIC(9, 6) NOT NULL,
    origin_lng NUMERIC(9, 6) NOT NULL,
    destination_lat NUMERIC(9, 6) NOT NULL,
    destination_lng NUMERIC(9, 6) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    price_per_passenger NUMERIC(10, 2) NOT NULL,
    seats_available INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (ride_id),
    FOREIGN KEY (vehicle_id) REFERENCES dev.vehicles(vehicle_id),
    CHECK (
        ride_status IN (
            'scheduled',
            'ongoing',
            'completed',
            'cancelled'
        )
    ),
    CHECK (seats_available >= 0),
    CHECK (price_per_passenger >= 0)
);


-- ============================================================
-- Ride passengers
-- ============================================================
CREATE TABLE dev.ride_passengers (
    ride_passenger_id UUID DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL,
    passenger_id UUID NOT NULL,
    ride_passenger_status VARCHAR(50) NOT NULL DEFAULT 'requested',
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    PRIMARY KEY (ride_passenger_id),
    UNIQUE (ride_id, passenger_id),
    FOREIGN KEY (ride_id) REFERENCES dev.rides(ride_id),
    FOREIGN KEY (passenger_id) REFERENCES dev.users(user_id),
    CHECK (
        ride_passenger_status IN (
            'requested',
            'accepted',
            'rejected',
            'cancelled',
            'completed'
        )
    )
);


-- ============================================================
-- Ride stops
-- ============================================================
CREATE TABLE dev.ride_stops (
    ride_stop_id UUID DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL,
    stop_lat NUMERIC(9, 6) NOT NULL,
    stop_lng NUMERIC(9, 6) NOT NULL,
    stop_order INT NOT NULL,
    estimated_arrival_time TIMESTAMPTZ NOT NULL,
    actual_arrival_time TIMESTAMPTZ,
    PRIMARY KEY (ride_stop_id),
    UNIQUE (ride_id, stop_order),
    FOREIGN KEY (ride_id) REFERENCES dev.rides(ride_id),
    CHECK (stop_order > 0)
);


-- ============================================================
-- Route estimates
-- ============================================================
CREATE TABLE dev.route_estimates (
    route_estimate_id UUID DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL,
    distance_km NUMERIC(10, 2) NOT NULL,
    duration_min NUMERIC(10, 2) NOT NULL,
    co2_estimate_kg NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (route_estimate_id),
    UNIQUE (ride_id),
    FOREIGN KEY (ride_id) REFERENCES dev.rides(ride_id),
    CHECK (distance_km >= 0),
    CHECK (duration_min >= 0),
    CHECK (co2_estimate_kg >= 0)
);


-- ============================================================
-- Reviews
-- ============================================================
CREATE TABLE dev.reviews (
    review_id UUID DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating SMALLINT NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (review_id),
    UNIQUE (ride_id, reviewer_id, reviewee_id),
    FOREIGN KEY (ride_id) REFERENCES dev.rides(ride_id),
    FOREIGN KEY (reviewer_id) REFERENCES dev.users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES dev.users(user_id),
    CHECK (
        rating BETWEEN 1 AND 5
    ),
    CHECK (reviewer_id <> reviewee_id)
);


-- ============================================================
-- Reports
-- ============================================================
CREATE TABLE dev.reports (
    report_id UUID DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    reported_id UUID NOT NULL,
    reason TEXT NOT NULL,
    report_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (report_id),
    UNIQUE (ride_id, reporter_id, reported_id),
    FOREIGN KEY (ride_id) REFERENCES dev.rides(ride_id),
    FOREIGN KEY (reporter_id) REFERENCES dev.users(user_id),
    FOREIGN KEY (reported_id) REFERENCES dev.users(user_id),
    CHECK (
        report_status IN (
            'pending',
            'reviewed',
            'resolved'
        )
    ),
    CHECK (reporter_id <> reported_id)
);


COMMIT;