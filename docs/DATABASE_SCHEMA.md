# Supabase Database Setup

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Get your `Project URL` and `Anon Key` from Settings > API

## Step 2: Create Tables

### Equipment Table

```sql
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    equipment_id VARCHAR(100) UNIQUE NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Loans Table

```sql
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
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);
```

## Step 3: Configure in Your Code

In `assets/script.js`, replace:

- `YOUR_SUPABASE_URL` with your Project URL
- `YOUR_SUPABASE_KEY` with your Anon Key

## Step 4: Pre-populate Equipment (Optional)

Insert sample equipment via Supabase SQL Editor:

```sql
INSERT INTO equipment (equipment_id, equipment_type, status) VALUES
('LAPTOP-001', 'Laptop', 'Available'),
('LAPTOP-002', 'Laptop', 'Available'),
('MONITOR-001', 'Monitor', 'Available'),
('KEYBOARD-001', 'Keyboard', 'Available');
```
