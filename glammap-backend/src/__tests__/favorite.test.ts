import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { testPool } from './testDb';

afterAll(async () => {
    await testPool.end();
});

describe('Favorite: toggle add then remove', () => {
    let token: string;
    let businessId: number;

    beforeAll(async () => {
        // Seed a client user
        const userRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Fav Client', $1, '8888888888', 'hash', 'client')
             RETURNING id`,
            [`fav_client_${Date.now()}@example.com`]
        );
        const userId = userRes.rows[0]!.id;

        // Seed an owner + business
        const ownerRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Fav Owner', $1, '9999999999', 'hash', 'owner')
             RETURNING id`,
            [`fav_owner_${Date.now()}@example.com`]
        );
        const ownerId = ownerRes.rows[0]!.id;

        const bizRes = await testPool.query<{ id: number }>(
            `INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, is_active)
             VALUES ($1, 'Fav Salon', 'salon', '321 Oak Ave', -34.6, -58.4, true)
             RETURNING id`,
            [ownerId]
        );
        businessId = bizRes.rows[0]!.id;

        token = jwt.sign(
            { id: userId, role: 'client' },
            process.env['JWT_SECRET'] ?? 'test_secret',
            { expiresIn: '1h' }
        );
    });

    it('POST /api/users/favorites/toggle — first toggle adds (isFavorite: true)', async () => {
        const res = await request(app)
            .post('/api/users/favorites/toggle')
            .set('Authorization', `Bearer ${token}`)
            .send({ businessId })
            .expect(200);

        expect(res.body.status).toBe('added');
    });

    it('POST /api/users/favorites/toggle — second toggle removes (isFavorite: false)', async () => {
        const res = await request(app)
            .post('/api/users/favorites/toggle')
            .set('Authorization', `Bearer ${token}`)
            .send({ businessId })
            .expect(200);

        expect(res.body.status).toBe('removed');
    });
});
