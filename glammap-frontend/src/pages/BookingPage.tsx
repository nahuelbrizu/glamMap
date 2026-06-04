import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingCalendar } from './BookingCalendar';
import { appointmentService } from '../api/services/appointment.service';

export const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleConfirm = async (date: Date, time: string) => {
    if (!id) return;

    const [hours, minutes] = time.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);

    try {
      await appointmentService.create({
        business_id: Number(id),
        service_id: 0, // TODO: pass selected service ID once service selection is wired
        start_time: start.toISOString(),
      });
      alert('¡Turno confirmado con éxito!');
      navigate('/appointments');
    } catch (err) {
      console.error('Error al confirmar turno:', err);
    }
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Negocio no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-display p-6 pb-28">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-6"
        aria-label="Volver"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-bold">Volver</span>
      </button>

      <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Reservar Turno</h1>

      <BookingCalendar businessId={id} onConfirm={handleConfirm} />
    </div>
  );
};
