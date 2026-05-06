import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}
// Definimos la interfaz de lo que viene dentro de TU token
interface TokenPayload {
  id: string; // Tu UUID de Postgres
  role: 'client' | 'business' | 'admin';
}

/**
 * Middleware principal: Extrae y valida el token sin importar 
 * si el usuario se logueó originalmente con Google o Email.
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    // Verificamos el token con tu secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Inyectamos los datos en req.user (que ya extendiste en tu declaración global)
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    // Si el token expiró o es falso, rechazamos
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}

/**
 * Validador de Roles: Se usa después de authenticateToken.
 * Acepta un array de roles permitidos.
 */
export const checkRole = (roles: Array<'client' | 'business' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validamos que exista el usuario y que su rol esté en la lista permitida
    if (!req.user || !roles.includes(req.user.role as any)) {
      return res.status(403).json({ message: "Acceso denegado: permisos insuficientes" });
    }
    next();
  };
};