import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const getOwnerStats = async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user.id;

    try {
        // Resolve owner's business
        const bizResult = await pool.query(
            'SELECT id FROM businesses WHERE owner_id = $1 LIMIT 1',
            [ownerId]
        );

        if (bizResult.rows.length === 0) {
            return res.status(404).json({ message: 'Negocio no encontrado para este owner' });
        }

        const businessId: number = bizResult.rows[0].id;

        // Run the three stat queries in parallel
        const [statusResult, ratingResult, topServiceResult] = await Promise.all([
            // Appointments by status in the last 30 days
            pool.query(
                `SELECT status, COUNT(*) AS count
                 FROM appointments
                 WHERE business_id = $1
                   AND start_time >= NOW() - INTERVAL '30 days'
                 GROUP BY status`,
                [businessId]
            ),

            // Average rating for the business
            pool.query(
                'SELECT COALESCE(AVG(rating), 0) AS avg_rating FROM reviews WHERE business_id = $1',
                [businessId]
            ),

            // Most requested service (by appointment count, all time)
            pool.query(
                `SELECT s.name, COUNT(a.id) AS count
                 FROM appointments a
                 JOIN services s ON s.id = a.service_id
                 WHERE a.business_id = $1
                 GROUP BY s.name
                 ORDER BY count DESC
                 LIMIT 1`,
                [businessId]
            ),
        ]);

        // Flatten status counts into { pending, confirmed, completed, cancelled }
        const appointmentsByStatus: Record<string, number> = {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        };
        for (const row of statusResult.rows) {
            appointmentsByStatus[row.status as string] = parseInt(row.count as string, 10);
        }

        const avgRating = parseFloat(ratingResult.rows[0].avg_rating as string);

        const topServiceRow = topServiceResult.rows[0] ?? null;
        const topService = topServiceRow
            ? { name: topServiceRow.name as string, count: parseInt(topServiceRow.count as string, 10) }
            : null;

        res.json({
            appointmentsByStatus,
            avgRating: Math.round(avgRating * 100) / 100,
            topService,
        });
    } catch (error) {
        next(error);
    }
};
