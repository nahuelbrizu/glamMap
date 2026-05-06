import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string; // Cambiado a string porque usas gen_random_uuid()
        role: 'client' | 'business' | 'admin'; 
      };
    }
  }
}