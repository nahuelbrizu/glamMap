import { Request, Response } from "express";
import * as favoriteService from "../services/favoriteService";

export const getUserFavorites = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const favorites = await favoriteService.getUserFavorites(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener favoritos" });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  const { businessId } = req.body;
  const userId = req.user.id;

  try {
    const status = await favoriteService.toggleFavorite(userId, businessId);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: "Error en favoritos" });
  }
};
