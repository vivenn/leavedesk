import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

// These routes are rejected before any database access, so no DB is needed
const { default: app } = await import('../../app.js');

function tokenFor(role) {
  return jwt.sign({ id: '00000000-0000-0000-0000-000000000001', role }, process.env.JWT_SECRET);
}

describe('API smoke tests (no database)', () => {
  test('GET /api/health reports the server is running', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('protected routes require a bearer token', async () => {
    const res = await request(app).get('/api/leave-requests');
    expect(res.status).toBe(401);
  });

  test('an invalid token is rejected', async () => {
    const res = await request(app).get('/api/leave-requests').set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(401);
  });

  test('the httpOnly session cookie is accepted in place of a bearer token', async () => {
    const res = await request(app).get('/api/audit-logs').set('Cookie', `lms_token=${tokenFor('Employee')}`);
    expect(res.status).toBe(403);
  });

  test('logout clears the session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/^lms_token=;.*HttpOnly/);
  });

  test('employees cannot reach admin-only routes', async () => {
    const res = await request(app).get('/api/audit-logs').set('Authorization', `Bearer ${tokenFor('Employee')}`);
    expect(res.status).toBe(403);
  });

  test('employees cannot escalate requests', async () => {
    const res = await request(app)
      .patch('/api/approvals/00000000-0000-0000-0000-000000000002/escalate')
      .set('Authorization', `Bearer ${tokenFor('Employee')}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('request-changes requires remarks', async () => {
    const res = await request(app)
      .patch('/api/approvals/00000000-0000-0000-0000-000000000002/request-changes')
      .set('Authorization', `Bearer ${tokenFor('Manager')}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/remarks/);
  });

  test('leave applications are validated before hitting the database', async () => {
    const res = await request(app)
      .post('/api/leave-requests')
      .set('Authorization', `Bearer ${tokenFor('Employee')}`)
      .send({ leaveTypeId: 'not-a-uuid', startDate: '2026-12-07', endDate: '2026-12-04', reason: 'x' });
    expect(res.status).toBe(400);
  });

  test('audit log filters are validated', async () => {
    const res = await request(app)
      .get('/api/audit-logs?actionType=DROP_TABLE')
      .set('Authorization', `Bearer ${tokenFor('Administrator')}`);
    expect(res.status).toBe(400);
  });
});
