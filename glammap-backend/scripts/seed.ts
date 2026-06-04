/**
 * GlamMap seed script — 9 beauty businesses in Buenos Aires
 * Run: pnpm seed  (or: ts-node-dev --transpile-only scripts/seed.ts)
 *
 * Inserts:
 *   - 9 businesses
 *   - 3 services per business
 *   - business_hours Mon–Sat 09:00–19:00, Sunday closed
 *   - 2 placeholder appointments (linked to the first seeded owner/client users)
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING where possible.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT ?? 5432),
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface BusinessSeed {
    name: string;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    description: string;
    services: Array<{ name: string; price: number; duration_minutes: number }>;
}

const BUSINESSES: BusinessSeed[] = [
    {
        name: 'Belleza Palermo',
        type: 'peluquería',
        address: 'Thames 1650, Palermo, Buenos Aires',
        latitude: -34.5860,
        longitude: -58.4335,
        phone: '+54 11 4831-0001',
        description: 'Salón boutique con especialistas en color y corte.',
        services: [
            { name: 'Corte de cabello', price: 3500, duration_minutes: 45 },
            { name: 'Coloración completa', price: 8000, duration_minutes: 90 },
            { name: 'Mechas balayage', price: 12000, duration_minutes: 120 },
        ],
    },
    {
        name: 'Uñas & Co. Recoleta',
        type: 'manicura',
        address: 'Ayacucho 1420, Recoleta, Buenos Aires',
        latitude: -34.5887,
        longitude: -58.3938,
        phone: '+54 11 4805-0002',
        description: 'Especialistas en nail art y manicura semipermanente.',
        services: [
            { name: 'Manicura clásica', price: 2500, duration_minutes: 40 },
            { name: 'Semipermanente', price: 4000, duration_minutes: 60 },
            { name: 'Nail art express', price: 3000, duration_minutes: 30 },
        ],
    },
    {
        name: 'Spa Centro Porteño',
        type: 'spa',
        address: 'Florida 620, Centro, Buenos Aires',
        latitude: -34.6037,
        longitude: -58.3737,
        phone: '+54 11 4322-0003',
        description: 'Tratamientos faciales y corporales en pleno centro.',
        services: [
            { name: 'Limpieza facial profunda', price: 5500, duration_minutes: 60 },
            { name: 'Masaje relajante', price: 6000, duration_minutes: 60 },
            { name: 'Peeling químico', price: 7000, duration_minutes: 75 },
        ],
    },
    {
        name: 'Estética San Telmo',
        type: 'estética',
        address: 'Defensa 850, San Telmo, Buenos Aires',
        latitude: -34.6222,
        longitude: -58.3703,
        phone: '+54 11 4361-0004',
        description: 'Estética integral en el barrio histórico porteño.',
        services: [
            { name: 'Depilación full legs', price: 4500, duration_minutes: 50 },
            { name: 'Tratamiento anti-edad', price: 8500, duration_minutes: 90 },
            { name: 'Crioterapia facial', price: 6500, duration_minutes: 45 },
        ],
    },
    {
        name: 'Glamour Villa Crespo',
        type: 'peluquería',
        address: 'Corrientes 5120, Villa Crespo, Buenos Aires',
        latitude: -34.5995,
        longitude: -58.4421,
        phone: '+54 11 4857-0005',
        description: 'Peluquería artística con técnicas vanguardistas.',
        services: [
            { name: 'Corte + secado', price: 5000, duration_minutes: 60 },
            { name: 'Keratina brasileña', price: 15000, duration_minutes: 180 },
            { name: 'Ondas permanentes', price: 10000, duration_minutes: 120 },
        ],
    },
    {
        name: 'Nail Studio Belgrano',
        type: 'manicura',
        address: 'Cabildo 1980, Belgrano, Buenos Aires',
        latitude: -34.5586,
        longitude: -58.4538,
        phone: '+54 11 4786-0006',
        description: 'Estudio de uñas gel y esculpidas en Belgrano.',
        services: [
            { name: 'Uñas de gel', price: 5500, duration_minutes: 75 },
            { name: 'Uñas esculpidas', price: 6500, duration_minutes: 90 },
            { name: 'Manicura express', price: 2000, duration_minutes: 25 },
        ],
    },
    {
        name: 'Piel Sana Caballito',
        type: 'estética',
        address: 'Rivadavia 5430, Caballito, Buenos Aires',
        latitude: -34.6191,
        longitude: -58.4431,
        phone: '+54 11 4903-0007',
        description: 'Tratamientos de salud y belleza para la piel.',
        services: [
            { name: 'Hidratación facial', price: 4800, duration_minutes: 50 },
            { name: 'Mesoterapia capilar', price: 9000, duration_minutes: 60 },
            { name: 'Microdermoabrasión', price: 7500, duration_minutes: 55 },
        ],
    },
    {
        name: 'Barbería El Gaucho',
        type: 'barbería',
        address: 'Av. Corrientes 3200, Balvanera, Buenos Aires',
        latitude: -34.6042,
        longitude: -58.4165,
        phone: '+54 11 4864-0008',
        description: 'Barbería clásica porteña, cortes y perfilados de barba.',
        services: [
            { name: 'Corte clásico', price: 3000, duration_minutes: 30 },
            { name: 'Afeitado con navaja', price: 3500, duration_minutes: 35 },
            { name: 'Corte + barba', price: 5500, duration_minutes: 55 },
        ],
    },
    {
        name: 'Zen Wellness Palermo Soho',
        type: 'spa',
        address: 'Nicaragua 4860, Palermo Soho, Buenos Aires',
        latitude: -34.5927,
        longitude: -58.4291,
        phone: '+54 11 4833-0009',
        description: 'Spa urbano con rituales orientales y masajes terapéuticos.',
        services: [
            { name: 'Ritual zen 60 min', price: 9500, duration_minutes: 60 },
            { name: 'Masaje piedras calientes', price: 11000, duration_minutes: 75 },
            { name: 'Drenaje linfático', price: 7000, duration_minutes: 60 },
        ],
    },
];

// business_hours: Mon(1)–Sat(6) open, Sun(0) closed
const WEEK_DAYS = [
    { day_of_week: 0, is_closed: true,  open_time: '09:00', close_time: '19:00' },
    { day_of_week: 1, is_closed: false, open_time: '09:00', close_time: '19:00' },
    { day_of_week: 2, is_closed: false, open_time: '09:00', close_time: '19:00' },
    { day_of_week: 3, is_closed: false, open_time: '09:00', close_time: '19:00' },
    { day_of_week: 4, is_closed: false, open_time: '09:00', close_time: '19:00' },
    { day_of_week: 5, is_closed: false, open_time: '09:00', close_time: '19:00' },
    { day_of_week: 6, is_closed: false, open_time: '09:00', close_time: '14:00' },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
    const client = await pool.connect();

    try {
        console.log('Starting GlamMap seed...');

        await client.query('BEGIN');

        // 1. Ensure a seed owner user exists
        const ownerResult = await client.query<{ id: string }>(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('Seed Owner', 'seed.owner@glammap.dev', 'no-login', 'owner')
             ON CONFLICT (email) DO UPDATE SET role = 'owner'
             RETURNING id`
        );
        const ownerId: string = ownerResult.rows[0].id;

        // 2. Ensure a seed client user exists
        const clientResult = await client.query<{ id: string }>(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('Seed Client', 'seed.client@glammap.dev', 'no-login', 'client')
             ON CONFLICT (email) DO UPDATE SET role = 'client'
             RETURNING id`
        );
        const clientId: string = clientResult.rows[0].id;

        let firstBusinessId: number | null = null;
        let firstServiceId: number | null = null;

        for (const biz of BUSINESSES) {
            // 3. Insert business (skip if already seeded by name+address)
            const bizResult = await client.query<{ id: number }>(
                `INSERT INTO businesses (owner_id, name, type, address, latitude, longitude, phone, description, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                 ON CONFLICT DO NOTHING
                 RETURNING id`,
                [ownerId, biz.name, biz.type, biz.address, biz.latitude, biz.longitude, biz.phone, biz.description]
            );

            // If conflict skipped insertion, fetch existing id
            let businessId: number;
            if (bizResult.rows.length === 0) {
                const existingResult = await client.query<{ id: number }>(
                    'SELECT id FROM businesses WHERE name = $1 AND address = $2 LIMIT 1',
                    [biz.name, biz.address]
                );
                businessId = existingResult.rows[0].id;
            } else {
                businessId = bizResult.rows[0].id;
            }

            if (firstBusinessId === null) firstBusinessId = businessId;

            // 4. Insert services
            for (const svc of biz.services) {
                const svcResult = await client.query<{ id: number }>(
                    `INSERT INTO services (business_id, name, price, duration_minutes, is_active)
                     VALUES ($1, $2, $3, $4, true)
                     ON CONFLICT DO NOTHING
                     RETURNING id`,
                    [businessId, svc.name, svc.price, svc.duration_minutes]
                );

                if (firstServiceId === null && svcResult.rows.length > 0) {
                    firstServiceId = svcResult.rows[0].id;
                }
            }

            // 5. Insert business_hours
            for (const h of WEEK_DAYS) {
                await client.query(
                    `INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (business_id, day_of_week) DO UPDATE
                       SET open_time = EXCLUDED.open_time,
                           close_time = EXCLUDED.close_time,
                           is_closed = EXCLUDED.is_closed`,
                    [businessId, h.day_of_week, h.open_time, h.close_time, h.is_closed]
                );
            }

            console.log(`  Seeded: ${biz.name} (id=${businessId})`);
        }

        // 6. Placeholder appointments (only if we have business + service ids)
        if (firstBusinessId !== null && firstServiceId !== null) {
            // Find the service duration for correct end_time
            const svcDurResult = await client.query<{ duration_minutes: number }>(
                'SELECT duration_minutes FROM services WHERE id = $1',
                [firstServiceId]
            );
            const durationMin: number = svcDurResult.rows[0]?.duration_minutes ?? 45;

            // Tomorrow at 10:00
            const start1 = new Date();
            start1.setDate(start1.getDate() + 1);
            start1.setHours(10, 0, 0, 0);
            const end1 = new Date(start1.getTime() + durationMin * 60_000);

            // Day after tomorrow at 11:00
            const start2 = new Date();
            start2.setDate(start2.getDate() + 2);
            start2.setHours(11, 0, 0, 0);
            const end2 = new Date(start2.getTime() + durationMin * 60_000);

            await client.query(
                `INSERT INTO appointments (client_id, business_id, service_id, start_time, end_time, notes, status)
                 VALUES ($1, $2, $3, $4, $5, 'Turno de prueba seed', 'pending')
                 ON CONFLICT DO NOTHING`,
                [clientId, firstBusinessId, firstServiceId, start1, end1]
            );

            await client.query(
                `INSERT INTO appointments (client_id, business_id, service_id, start_time, end_time, notes, status)
                 VALUES ($1, $2, $3, $4, $5, 'Segundo turno de prueba', 'confirmed')
                 ON CONFLICT DO NOTHING`,
                [clientId, firstBusinessId, firstServiceId, start2, end2]
            );

            console.log(`  Seeded 2 placeholder appointments for business id=${firstBusinessId}`);
        }

        await client.query('COMMIT');
        console.log('Seed completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed, rolled back:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
