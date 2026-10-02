CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    financial_year VARCHAR(9) NOT NULL,
    opening_balance DECIMAL(5,2) NOT NULL,
    available_balance DECIMAL(5,2) NOT NULL,
    used_balance DECIMAL(5,2) DEFAULT 0,
    carryforward_balance DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, leave_type_id, financial_year)
);

CREATE INDEX idx_lb_user ON leave_balances(user_id);
CREATE INDEX idx_lb_leave_type ON leave_balances(leave_type_id);
CREATE INDEX idx_lb_financial_year ON leave_balances(financial_year);
