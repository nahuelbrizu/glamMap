import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { BadRequestError } from '../errors/customErrors';
import type { UserRole } from '../types/index';

const VALID_ROLES: UserRole[] = ['client', 'owner', 'admin'];

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    try {
        const result = await adminService.getAllUsers(page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role } = req.body as { role: UserRole };

    try {
        if (!VALID_ROLES.includes(role)) {
            throw new BadRequestError(
                `Rol inválido: '${role}'. Los valores permitidos son: ${VALID_ROLES.join(', ')}`
            );
        }
        await adminService.updateUserStatus(parseInt(id, 10), role);
        res.json({ message: 'Rol de usuario actualizado' });
    } catch (error) {
        next(error);
    }
};

export const getPendingBusinesses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const businesses = await adminService.getPendingBusinesses();
        res.json(businesses);
    } catch (error) {
        next(error);
    }
};

export const approveBusiness = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { active } = req.body as { active: boolean };

    try {
        await adminService.approveBusiness(parseInt(id, 10), active);
        res.json({ message: active ? 'Negocio aprobado' : 'Negocio suspendido' });
    } catch (error) {
        next(error);
    }
};
