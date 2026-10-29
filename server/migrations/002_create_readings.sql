-- Migration: 002_create_readings.sql
-- Description: Create readings table with constraints and indexes

CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Only allowed time slots
    CONSTRAINT check_time_slot CHECK (
        time_slot IN ('morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner')
    ),

    -- Constraint: Value between 40 and 600 mg/dL inclusive
    CONSTRAINT check_glucose_value CHECK (
        glucose_value >= 40 AND glucose_value <= 600
    ),

    -- Constraint: Unique reading per user, date, and slot
    CONSTRAINT unique_user_date_slot UNIQUE (
        user_id, reading_date, time_slot
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings (user_id);
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings (user_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_readings_user_date_slot ON readings (user_id, reading_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_readings_user_date_desc ON readings (user_id, reading_date DESC, created_at DESC);
