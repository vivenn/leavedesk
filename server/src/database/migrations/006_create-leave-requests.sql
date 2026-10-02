CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    num_days DECIMAL(5,2) NOT NULL,
    reason TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status VARCHAR(30) DEFAULT 'PENDING',
    financial_year VARCHAR(9) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lr_user ON leave_requests(user_id);
CREATE INDEX idx_lr_status ON leave_requests(status);
CREATE INDEX idx_lr_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_lr_financial_year ON leave_requests(financial_year);
