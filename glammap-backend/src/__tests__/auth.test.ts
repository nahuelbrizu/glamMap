// src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';

afterAll(() => {
  pool.end();
});

describe('Auth Routes', () => {
  it('should return 422 for invalid registration data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: '123', // Too short
      });
    expect(res.statusCode).toEqual(422);
  });

  it('should return 422 for invalid login data', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
      });
    expect(res.statusCode).toEqual(422);
  });
});
