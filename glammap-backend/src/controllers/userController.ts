import { Request, Response } from 'express';
import * as userService from '../services/userService';

/**
 * Obtiene todos los usuarios de la base de datos
 * GET /api/users/all
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error("Error en getAllUsers:", error.message);
    res.status(500).json({ message: "Error al obtener la lista de usuarios" });
  }
};

/**
 * Obtiene el perfil del usuario autenticado actualmente
 * GET /api/users/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Error en getUserProfile:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualiza las preferencias de notificación
 */
export const updateNotificationPrefs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { prefs } = req.body; 

    await userService.updateNotificationPrefs(userId, prefs);
    
    res.json({ message: "Preferencias actualizadas" });
  } catch (error: any) {
    console.error("Error en updateNotificationPrefs:", error.message);
    res.status(500).json({ message: "Error al actualizar preferencias" });
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const userId = (req as any).user.id;

  try {
    const user = await userService.updateProfile(userId, name, phone);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Perfil actualizado",
      user
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};