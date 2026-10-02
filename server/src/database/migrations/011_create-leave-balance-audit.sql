CREATE TABLE leave_balance_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_balance_id UUID NOT NULL REFERENCES leave_balances(id),
    previous_balance DECIMAL(5,2) NOT NULL,
    new_balance DECIMAL(5,2) NOT NULL,
    change_reason VARCHAR(50) NOT NULL,
    leave_request_id UUID REFERENCES leave_requests(id),
    changed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lba_balance ON leave_balance_audit(leave_balance_id);
CREATE INDEX idx_lba_created ON leave_balance_audit(created_at);
