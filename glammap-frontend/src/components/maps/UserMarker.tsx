import { AdvancedMarker } from "@vis.gl/react-google-maps";

export const UserMarker = ({ position }: { position: { lat: number; lng: number } }) => {
  if (!position?.lat || !position?.lng) return null;

  return (
    <AdvancedMarker 
      position={position} 
      zIndex={1000}
      // 'collisionBehavior' evita que el marcador del usuario desaparezca si se choca con otro
      collisionBehavior="OPTIONAL_AND_HIDES_LOWER_PRIORITY"
    >
      <div className="relative flex items-center justify-center pointer-events-none">
        {/* Efecto de pulso animado - Suavizado */}
        <div className="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
        
        {/* Halo exterior para mejor visibilidad en mapas oscuros */}
        <div className="absolute w-6 h-6 bg-blue-500/20 rounded-full blur-sm"></div>
        
        {/* Punto central sólido */}
        <div className="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
      </div>
    </AdvancedMarker>
  );
};