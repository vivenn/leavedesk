CREATE TABLE blood_relation_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    relation VARCHAR(30) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    leave_request_id UUID REFERENCES leave_requests(id),
    used_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, relation)
);

CREATE INDEX idx_brl_user ON blood_relation_leaves(user_id);
