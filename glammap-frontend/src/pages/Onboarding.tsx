import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Bienvenido a Stitch",
      description: "Tu próxima cita de belleza está a solo unos toques de distancia. Simple, rápido y elegante.",
      icon: "auto_awesome",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Encuentra lo mejor",
      description: "Explora estéticas y salones cercanos a través de nuestro mapa interactivo en tiempo real.",
      icon: "map_search",
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Reserva al instante",
      description: "Elige tu servicio, el profesional y el horario que mejor te convenga sin llamadas ni esperas.",
      icon: "calendar_add_on",
      image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Todo en un lugar",
      description: "Gestiona tus turnos, favoritos y notificaciones desde un perfil diseñado para ti.",
      icon: "person_check",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => navigate('/login');

  return (
    <div className="h-screen w-full bg-background-dark text-white font-display overflow-hidden flex flex-col">
      
      {/* Imagen de fondo con Overlay */}
      <div className="relative h-[60%] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-110"
          style={{ backgroundImage: `url(${slides[currentStep].image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
        
        {/* Botón Saltar */}
        <button 
          onClick={handleSkip}
          className="absolute top-12 right-6 text-sm font-bold bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
        >
          Saltar
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-8 flex flex-col justify-between pb-12 -mt-20 relative z-10">
        <div className="space-y-4">
          {/* Icono animado */}
          <div className="bg-primary size-14 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 rotate-3">
            <span className="material-symbols-outlined text-background-dark text-3xl font-black">
              {slides[currentStep].icon}
            </span>
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none animate-fade-in">
            {slides[currentStep].title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {slides[currentStep].description}
          </p>
        </div>

        {/* Footer: Indicadores y Botón */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="bg-primary text-background-dark size-16 rounded-full flex items-center justify-center shadow-xl shadow-primary/20 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined font-black">
              {currentStep === slides.length - 1 ? 'done' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};