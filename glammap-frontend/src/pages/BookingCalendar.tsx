import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../api/axiosInstance';

interface BookingCalendarProps {
  businessId: string;
  onConfirm: (date: Date, time: string) => void;
}

export const BookingCalendar = ({ businessId, onConfirm }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await api.get(`/user/available-slots`, {
          params: { business_id: businessId, date: dateStr }
        });
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
        // Mock para testing visual si falla la API
        setTimeSlots(["09:00", "10:30", "11:00", "15:00", "16:30"]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, businessId]);

  return (
    <div className="bg-white dark:bg-[#121f22] rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-white/5">
      
      {/* Título de Sección */}
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary text-xl">event_available</span>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Selecciona fecha y hora</h3>
      </div>

      {/* Selector de días horizontal */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                setSelectedDate(day);
                setSelectedTime(null);
              }}
              className={`flex flex-col items-center min-w-[65px] py-4 rounded-2xl transition-all relative ${
                isSelected 
                  ? "bg-primary text-slate-950 shadow-lg shadow-primary/20 scale-105" 
                  : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className={`text-[9px] uppercase font-black mb-1 ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                {format(day, 'EEE', { locale: es })}
              </span>
              <span className="text-xl font-black">{format(day, 'd')}</span>
              {/* Indicador de "Hoy" */}
              {isSameDay(day, new Date()) && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid de Horas */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horarios disponibles</h4>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {loading ? (
            // Skeletons de carga
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-11 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))
          ) : timeSlots.length > 0 ? (
            timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-black transition-all border ${
                  selectedTime === time 
                    ? "bg-slate-900 dark:bg-primary text-white dark:text-slate-950 border-transparent scale-105 shadow-md" 
                    : "bg-white dark:bg-[#18282b] text-slate-600 dark:text-slate-300 border-slate-100 dark:border-white/5 hover:border-primary/50"
                }`}
              >
                {time}
              </button>
            ))
          ) : (
            <div className="col-span-4 py-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">event_busy</span>
              <p className="text-xs font-bold text-slate-400 italic">No hay turnos disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen y Botón de Acción */}
      <div className="mt-10 space-y-4">
        {selectedTime && (
          <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 rounded-2xl animate-fade-in">
            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
            <p className="text-xs font-bold text-primary uppercase">
              {format(selectedDate, "eeee d 'de' MMMM", { locale: es })} a las {selectedTime} hs
            </p>
          </div>
        )}

        <button
          disabled={!selectedTime || loading}
          onClick={() => selectedTime && onConfirm(selectedDate, selectedTime)}
          className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
            selectedTime 
              ? "bg-slate-950 dark:bg-primary text-white dark:text-slate-950 shadow-primary/20 hover:brightness-110" 
              : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined">bolt</span>
          CONFIRMAR RESERVA
        </button>
      </div>
    </div>
  );
};