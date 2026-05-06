// src/controllers/adminController.ts
import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

// GESTIÓN DE USUARIOS
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await adminService.updateUserStatus(parseInt(id, 10), role);
        res.json({ message: "Rol de usuario actualizado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

// GESTIÓN DE NEGOCIOS (Aprobar/Rechazar)
export const getPendingBusinesses = async (req: Request, res: Response) => {
    try {
        const businesses = await adminService.getPendingBusinesses();
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener negocios pendientes" });
    }
};

export const approveBusiness = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { active } = req.body;
    try {
        await adminService.approveBusiness(parseInt(id, 10), active);
        res.json({ message: active ? "Negocio aprobado" : "Negocio suspendido" });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estado del negocio" });
    }
};