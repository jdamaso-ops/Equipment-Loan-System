CREATE TABLE IF NOT EXISTS sms_log (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    vonage_sd VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);