CREATE TABLE IF NOT EXISTS maintenance_log (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    technician VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);