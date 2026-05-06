import React from "react";
import { MapContainer } from "../components/maps/MapContainer";
import { BusinessCard } from "../components/business/BusinessCard";
import { FilterBar } from "../components/ui/FilterBar";
import { LocationButton } from "../components/ui/LocationButton";
import { BottomTabBar } from "../layouts/BottomTabBar";
import { PlaceAutocomplete } from "../components/maps/PlaceAutocomplete";
import { useExploreLogic } from "../hooks/useExploreLogic";

const FILTERS = ["Todos", "Peluquería", "Uñas", "Barbería", "Estética"];
const MAP_ID = "c1dc4759a42f59ba4d0f03c2";

export const Explore = () => {
  const {
    businesses,
    activeFilter,
    setActiveFilter,
    userLocation,
    selectedBusiness,
    setSelectedBusiness,
    handleCenterOnUser,
    handlePlaceSelect,
    INITIAL_CENTER,
    loading
  } = useExploreLogic();

  return (
    <div className="grid h-full w-full overflow-hidden" aria-label="Explore businesses">
      {/* MAPA - Always rendered */}
      <div className="[grid-area:1/1]">
        <MapContainer
          businesses={businesses}
          userLocation={userLocation}
          selectedBusiness={selectedBusiness}
          onSelectBusiness={setSelectedBusiness}
          initialCenter={INITIAL_CENTER}
          mapId={MAP_ID}
          onMapClick={() => setSelectedBusiness(null)}
        />
      </div>

      {/* HEADER: Buscador y Filtros */}
      <header className="relative [grid-area:1/1] z-50 pt-10 pb-6 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none">
        <div className="px-6 space-y-4 pointer-events-auto">
          <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} userLocation={userLocation} />
          <FilterBar filters={FILTERS} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
      </header>
      
      {/* OVERLAYS ON MAP */}
      <div className="relative [grid-area:1/1] z-40 pointer-events-none">
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 pointer-events-auto">
            <span className="text-white text-xs font-medium animate-pulse">Buscando locales...</span>
          </div>
        )}

        {/* Empty State Message */}
        {!loading && businesses.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">sentiment_dissatisfied</span>
            <h3 className="text-xl font-bold text-white mb-2">No se encontraron negocios</h3>
            <p className="text-slate-400">Intenta ajustar tus filtros o ubicación.</p>
          </div>
        )}

        {/* Location Button */}
        <div 
          className="absolute transition-all duration-300 pointer-events-auto"
          style={{ bottom: selectedBusiness ? '320px' : '120px', right: '24px' }}
        >
          <LocationButton onClick={handleCenterOnUser} isVisible={!!userLocation} />
        </div>

        {/* Business Card */}
        {selectedBusiness && (
          <div className="absolute bottom-28 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
            <BusinessCard 
              business={selectedBusiness} 
              onClose={() => setSelectedBusiness(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};