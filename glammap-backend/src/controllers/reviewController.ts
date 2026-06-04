import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/reviewService';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // appointment id from URL
    const { rating, comment, imageUrl } = req.body as {
        rating: number;
        comment: string;
        imageUrl: string;
    };

    try {
        await reviewService.createReview(
            req.user.id,
            parseInt(id, 10),
            rating,
            comment,
            imageUrl ?? ''
        );
        res.status(201).json({ message: 'Reseña enviada correctamente' });
    } catch (error) {
        next(error);
    }
};
