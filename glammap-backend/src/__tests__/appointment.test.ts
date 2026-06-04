import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { testPool } from './testDb';

afterAll(async () => {
    await testPool.end();
});

describe('Appointment: create → verify end_time', () => {
    let token: string;
    let businessId: number;
    let serviceId: number;

    beforeAll(async () => {
        // Seed a client user
        const userRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Appt Client', $1, '2222222222', 'hash', 'client')
             RETURNING id`,
            [`appt_client_${Date.now()}@example.com`]
        );
        const userId = userRes.rows[0]!.id;

        // Seed an owner user
        const ownerEmail = `appt_owner_${Date.now()}@example.com`;
        const ownerRes = await testPool.query<{ id: string }>(
            `INSERT INTO users (name, email, phone, password_hash, role)
             VALUES ('Appt Owner', $1, '3333333333', 'hash', 'owner')
             RETURNING id`,
            [ownerEmail]
        );
        const ownerId = ownerRes.rows[0]!.id;

        // Seed a business
        const bizRes = await testPool.query<{ id: number }>(
            `INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, is_active)
             VALUES ($1, 'Test Salon', 'salon', '123 Main St', -34.6, -58.4, true)
             RETURNING id`,
            [ownerId]
        );
        businessId = bizRes.rows[0]!.id;

        // Seed a service with 60 minute duration
        const svcRes = await testPool.query<{ id: number }>(
            `INSERT INTO services (business_id, name, price, duration_minutes, is_active)
             VALUES ($1, 'Haircut', 1500, 60, true)
             RETURNING id`,
            [businessId]
        );
        serviceId = svcRes.rows[0]!.id;

        // Issue a JWT for the client
        token = jwt.sign(
            { id: userId, role: 'client' },
            process.env['JWT_SECRET'] ?? 'test_secret',
            { expiresIn: '1h' }
        );
    });

    it('POST /api/users/appointments — returns 201 + end_time = start_time + 60 min', async () => {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(10, 0, 0, 0);

        const res = await request(app)
            .post('/api/users/appointments')
            .set('Authorization', `Bearer ${token}`)
            .send({
                business_id: businessId,
                service_id: serviceId,
                start_time: startTime.toISOString(),
                notes: 'Integration test',
            })
            .expect(201);

        const { appointment } = res.body as { appointment: { start_time: string; end_time: string } };
        expect(appointment).toBeDefined();

        const start = new Date(appointment.start_time);
        const end = new Date(appointment.end_time);
        const diffMinutes = (end.getTime() - start.getTime()) / 60_000;

        expect(diffMinutes).toBe(60);
    });
});
