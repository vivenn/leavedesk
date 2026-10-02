CREATE TABLE leave_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_request_id UUID NOT NULL REFERENCES leave_requests(id),
    approver_id UUID NOT NULL REFERENCES users(id),
    approver_role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    remarks TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_la_leave_request ON leave_approvals(leave_request_id);
CREATE INDEX idx_la_approver ON leave_approvals(approver_id);
