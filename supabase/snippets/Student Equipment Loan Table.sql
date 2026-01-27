CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    equipment_id VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'On Loan',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE RESTRICT,
    FOREIGN KEY (student_email) REFERENCES students(email) ON DELETE RESTRICT
);