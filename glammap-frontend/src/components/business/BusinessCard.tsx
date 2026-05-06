import { BookingCalendar } from '../../pages/BookingCalendar';
import api from "../../api/axiosInstance";
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi'; // For close button
import { useNavigate } from 'react-router-dom'; // For navigation
import toast from 'react-hot-toast';

// Assuming BusinessCardProps interface defines structure for business and onClose
interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    category: string;
    address: string;
    rating_avg: number;
    logo_url: string;
    distance: string | null;
    position: { lat: number; lng: number };
    services?: Array<{ id: string; name: string; duration_minutes: number; price: number }>;
    isGoogleResult?: boolean;
  };
  onClose: () => void;
}

export const BusinessCard = ({ business, onClose }: BusinessCardProps) => {
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  const handleConfirmAppointment = async (selectedDate: Date, selectedTime: string) => {
    const loadingToast = toast.loading('Reservando turno...');
    try {
      // Combinamos fecha y hora para el backend
      const [hours, minutes] = selectedTime.split(':');
      const start_time = new Date(selectedDate);
      start_time.setHours(parseInt(hours), parseInt(minutes), 0);

      const response = await api.post('/appointments/create', {
        business_id: business.id,
        service_id: business.services?.[0]?.id, // Using optional chaining and index for first service
        start_time: start_time.toISOString(),
        notes: "Reserva desde el mapa"
      });

      toast.success('¡Turno reservado con éxito!', { id: loadingToast });
      onClose();
    } catch (error) {
      console.error("Error al reservar:", error);
      toast.error('No se pudo realizar la reserva.', { id: loadingToast });
    }
  };

  const viewBusinessDetails = () => {
    navigate(`/business/${business.id}`);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2"
        aria-label="Close business details"
      >
        <FiX className="text-2xl"/>
      </button>
      
      <div className="flex items-center gap-4 mb-4">
        {business.logo_url ? (
          <img src={business.logo_url} alt={`${business.name} logo`} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
        ) : (
          <div className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-full border-2 border-primary">
            <span className="material-symbols-outlined text-primary text-3xl">store</span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-white">{business.name}</h3>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">star</span> {business.rating_avg}
            {business.distance && <span className="ml-1">• {business.distance} km</span>}
          </p>
          <p className="text-sm text-slate-400 line-clamp-1">{business.address}</p>
        </div>
      </div>

      {!isBooking ? (
        <div className="flex flex-col gap-3">
          {!business.isGoogleResult && (
            <>
              <button
                onClick={viewBusinessDetails}
                className="w-full bg-transparent border border-primary text-primary py-3 rounded-2xl font-bold hover:bg-primary/10 transition-all"
              >
                Ver Detalles
              </button>
              <button
                onClick={() => setIsBooking(true)}
                className="w-full bg-primary text-slate-950 py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Reservar Turno
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <BookingCalendar 
            businessId={business.id} 
            onConfirm={handleConfirmAppointment}
            // Pass onClose prop to BookingCalendar if it needs to close itself
            // onCloseBooking={() => setIsBooking(false)} // Example if BookingCalendar has a cancel/close button
          />
        </div>
      )}
    </div>
  );
};
