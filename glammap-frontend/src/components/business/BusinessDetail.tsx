import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableTimes = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];

  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      fullDate: d.toISOString().split("T")[0],
      dayName: d
        .toLocaleDateString("es-AR", { weekday: "short" })
        .replace(".", ""),
      dayNum: d.getDate(),
    };
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/user/business/${id}`);
        setBusiness(res.data);
      } catch (error) {
        console.error("Error cargando negocio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedTime) return;

    try {
      const start_time = new Date(
        `${selectedDate}T${selectedTime}:00`
      ).toISOString();

      await api.post("/user/appointments", {
        business_id: id,
        service_id: selectedService.id,
        start_time,
      });

      alert("¡Turno confirmado!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error al reservar:", error);
      alert("No se pudo reservar el turno");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-primary">
        Cargando experiencia...
      </div>
    );

  if (!business) return <div className="p-10">Negocio no encontrado</div>;

  return (
    <div className="min-h-screen bg-white font-display pb-24">
      {/* HEADER */}
      <div className="relative h-72">
        <img
          src={
            business.banner_url ||
            "https://images.unsplash.com/photo-1560066984-138dadb4c035"
          }
          className="w-full h-full object-cover rounded-b-[3rem]"
          alt={business.name}
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 bg-white/20 backdrop-blur-xl text-white p-3 rounded-2xl"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      {/* INFO */}
      <div className="px-6 -mt-10">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl">
          <h1 className="text-3xl font-black uppercase">{business.name}</h1>
          <p className="text-slate-400 text-sm mt-2">{business.address}</p>
        </div>
      </div>

      {/* SERVICIOS */}
      <div className="mt-8 px-6">
        <h2 className="text-xl font-black uppercase mb-4">
          Servicios disponibles
        </h2>

        <div className="space-y-4">
          {business.services?.map((service: any) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl cursor-pointer active:scale-95 transition"
            >
              <div>
                <p className="font-bold">{service.name}</p>
                <p className="text-xs text-slate-400">
                  {service.duration} min
                </p>
              </div>
              <p className="font-black text-primary">${service.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TURNO */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-8">
            <div className="flex justify-between mb-6">
              <h3 className="font-black uppercase">
                {selectedService.name}
              </h3>
              <button onClick={() => setSelectedService(null)}>✕</button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4">
              {nextDays.map((d) => (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`min-w-[60px] py-3 rounded-xl font-bold ${
                    selectedDate === d.fullDate
                      ? "bg-primary text-white"
                      : "bg-slate-100"
                  }`}
                >
                  {d.dayName}
                  <br />
                  {d.dayNum}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-3 rounded-xl font-bold ${
                    selectedTime === t
                      ? "bg-secondary text-white"
                      : "bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={!selectedTime}
              className="w-full mt-6 py-5 rounded-2xl bg-primary text-white font-black disabled:opacity-40"
            >
              Confirmar Turno
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
