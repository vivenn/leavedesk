CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_type_name VARCHAR(50) UNIQUE NOT NULL,
    yearly_limit INTEGER NOT NULL,
    is_carryforward_allowed BOOLEAN DEFAULT FALSE,
    max_carryforward_days INTEGER,
    expiry_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
