import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/serviceService';

export const listServices = async (req: Request, res: Response, next: NextFunction) => {
    const { business_id } = req.query as { business_id: string };

    try {
        const services = await serviceService.getServicesByBusiness(parseInt(business_id, 10));
        res.json(services);
    } catch (error) {
        next(error);
    }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
    const { business_id, name, price, duration_minutes } = req.body as {
        business_id: number;
        name: string;
        price: number;
        duration_minutes: number;
    };

    try {
        const service = await serviceService.createService(req.user.id, {
            business_id,
            name,
            price,
            duration_minutes,
        });
        res.status(201).json({ message: 'Servicio creado', service });
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, price, duration_minutes } = req.body as {
        name?: string;
        price?: number;
        duration_minutes?: number;
    };

    try {
        const service = await serviceService.updateService(parseInt(id, 10), req.user.id, {
            name,
            price,
            duration_minutes,
        });
        res.json({ message: 'Servicio actualizado', service });
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        await serviceService.deleteService(parseInt(id, 10), req.user.id);
        res.json({ message: 'Servicio eliminado' });
    } catch (error) {
        next(error);
    }
};
