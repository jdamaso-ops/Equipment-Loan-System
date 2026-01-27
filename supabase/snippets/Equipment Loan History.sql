CREATE TABLE IF NOT EXISTS loan_history (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    equipment_id VARCHAR(100) NOT NULL,
    checkout_date DATE NOT NULL,
    return_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);