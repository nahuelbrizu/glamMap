import request from 'supertest';
import app from '../app';
import { testPool } from './testDb';

afterAll(async () => {
    await testPool.end();
});

describe('Auth flow: register → login → me', () => {
    const user = {
        name: 'Test User',
        email: `test_auth_${Date.now()}@example.com`,
        phone: '1111111111',
        password: 'password123',
    };

    let token: string;

    it('POST /api/auth/register — creates user and returns token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user)
            .expect(201);

        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toMatchObject({ email: user.email });
        token = res.body.token as string;
    });

    it('POST /api/auth/login — returns 200 + token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: user.password })
            .expect(200);

        expect(res.body).toHaveProperty('token');
        token = res.body.token as string;
    });

    it('GET /api/auth/me — returns user object', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toMatchObject({ email: user.email });
    });

    it('POST /api/auth/register — returns 422 for invalid data', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'not-an-email', password: '123' })
            .expect(422);
    });

    it('POST /api/auth/login — returns 422 when password missing', async () => {
        await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com' })
            .expect(422);
    });
});
