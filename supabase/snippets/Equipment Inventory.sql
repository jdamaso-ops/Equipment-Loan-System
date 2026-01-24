CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(100) UNIQUE NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);