CREATE TABLE IF NOT EXISTS email_log (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);