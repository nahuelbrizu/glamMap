import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import dotenv from 'dotenv';

import './config/db'; // Conecta a PostgreSQL
import './config/passport'; // Configuración de Google Strategy
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import businessRoutes from './routes/businessRoutes';

// Inicialización de variables de entorno
dotenv.config();

const app: Application = express();

// --- MIDDLEWARES ---
// CORS: Permite que tu frontend de Vite (pnpm dev) acceda a la API
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Morgan: Muestra logs de las peticiones en la terminal de Ubuntu
app.use(morgan('dev'));

// Express JSON: Permite recibir bodies en formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport: Inicialización para autenticación con Google
app.use(passport.initialize());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/business', businessRoutes);
app.use("/api/business", businessRoutes);


// Ruta de salud (Health Check)
app.get('/', (req: Request, res: Response) => {
    res.send('GlamMap API is running... 🚀');
});




import { errorHandler } from './middlewares/errorHandler';

// ... (existing code) ...

// --- MANEJO DE ERRORES GLOBAL ---
app.use(errorHandler);

// --- LANZAMIENTO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    =========================================
    ✨ GlamMap Backend cargado con éxito
    📡 Puerto: ${PORT}
    🌍 Entorno: ${process.env.NODE_ENV || 'development'}
    =========================================
    `);
});

export default app;