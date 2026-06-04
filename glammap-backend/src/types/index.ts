export type UserRole = 'client' | 'owner' | 'admin';

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface BusinessHour {
    day_of_week: number; // 0-6
    open_time: string;   // "09:00"
    close_time: string;  // "18:00"
    is_closed: boolean;
}

export interface Service {
    id: string;
    business_id: string;
    name: string;
    price: number;
    duration_minutes: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
