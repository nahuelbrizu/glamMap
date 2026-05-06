// src/controllers/reviewController.ts
import { Request, Response } from 'express';
import { pool } from '../config/db';
import * as reviewService from '../services/reviewService';

export const createReview = async (req: Request, res: Response) => {
    const { businessId, rating, comment, imageUrl } = req.body;
    const userId = req.user.id;

    try {
        await reviewService.createReview(businessId, userId, rating, comment, imageUrl);
        res.status(201).json({ message: "Reseña enviada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar reseña" });
    }
};