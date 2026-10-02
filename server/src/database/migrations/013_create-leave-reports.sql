CREATE TABLE leave_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    report_month VARCHAR(7) NOT NULL,
    department_id UUID REFERENCES departments(id),
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_month ON leave_reports(report_month);
CREATE INDEX idx_reports_type ON leave_reports(report_type);
