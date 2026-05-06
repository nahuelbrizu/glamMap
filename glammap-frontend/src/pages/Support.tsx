import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'business'>('client');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { id: 1, icon: 'calendar_month', question: '¿Cómo cancelo una cita?', type: 'client' },
    { id: 2, icon: 'location_on', question: 'Problemas con la ubicación', type: 'both' },
    { id: 3, icon: 'account_circle', question: 'Gestionar cuenta de Google', type: 'both' },
    { id: 4, icon: 'payments', question: 'Configurar métodos de pago', type: 'business' },
    { id: 5, icon: 'storefront', question: '¿Cómo subir mis servicios?', type: 'business' },
  ];

  const filteredFaqs = faqs.filter(faq => 
    (faq.type === userType || faq.type === 'both') &&
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      
      {/* TopAppBar */}
      <div className="flex items-center p-4 pb-2 sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="size-12 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold pr-12">Ayuda y Soporte</h2>
      </div>

      {/* SearchBar */}
      <div className="px-4 py-2">
        <div className="flex items-center rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden focus-within:ring-2 ring-primary/50 transition-all">
          <div className="pl-4 text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-4 px-4 outline-none text-base placeholder:text-slate-400 dark:placeholder:text-[#9db4b9]"
            placeholder="Buscar ayuda o tutoriales..."
          />
        </div>
      </div>

      {/* SegmentedButtons */}
      <div className="px-4 py-4">
        <div className="flex h-12 rounded-2xl bg-surface-light dark:bg-surface-dark p-1.5 shadow-inner">
          <button 
            onClick={() => setUserType('client')}
            className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
              userType === 'client' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            Soy Cliente
          </button>
          <button 
            onClick={() => setUserType('business')}
            className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
              userType === 'business' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            Soy Negocio
          </button>
        </div>
      </div>

      {/* Support Actions Grid */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-4">Asistencia Directa</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'chat', label: 'WhatsApp', color: 'bg-green-500/10 text-green-500' },
            { icon: 'mail', label: 'Email', color: 'bg-primary/10 text-primary' },
            { icon: 'call', label: 'Llamar', color: 'bg-blue-500/10 text-blue-500' },
          ].map((action, idx) => (
            <button key={idx} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all group active:scale-95">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors ${action.color}`}>
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <span className="text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Preguntas Frecuentes</h3>
          <button className="text-primary text-sm font-bold">Ver todo</button>
        </div>
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <span className="material-symbols-outlined text-[20px]">{faq.icon}</span>
                </div>
                <span className="text-sm font-bold">{faq.question}</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorials */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-bold mb-4">Tutoriales en Video</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2].map((i) => (
            <div key={i} className="shrink-0 w-72 space-y-3">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-200 dark:bg-surface-dark group cursor-pointer">
                <img 
                  src={`https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400`} 
                  alt="tutorial" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Configura tu perfil profesional</p>
                <p className="text-xs text-slate-500">3:45 min • Para Negocios</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legal */}
      <div className="px-4 py-8 border-t border-slate-200 dark:border-white/10 space-y-4">
        {['Política de Privacidad', 'Términos de Servicio'].map((text) => (
          <div key={text} className="flex items-center justify-between text-slate-500 hover:text-primary cursor-pointer transition-colors">
            <span className="text-sm font-medium">{text}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </div>
        ))}
        <p className="text-center text-xs text-slate-500 mt-6">Versión 2.5.0 • Build 2026</p>
      </div>
    </div>
  );
};

export default Support;