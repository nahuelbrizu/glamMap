import { Map } from "@vis.gl/react-google-maps";
import { BusinessMarker } from "./BusinessMarker";
import { UserMarker } from "./UserMarker";

type Props = {
  businesses: any[];
  userLocation: { lat: number; lng: number } | null;
  selectedBusiness: any;
  onSelectBusiness: (business: any) => void;
  initialCenter: { lat: number; lng: number };
  mapId: string;
};

export const MapContainer = ({
  businesses,
  userLocation,
  selectedBusiness,
  onSelectBusiness,
  initialCenter,
  mapId,
}: Props) => {
  return (
    /* Forzamos dimensiones absolutas en el contenedor inmediato. 
       Si el padre (Explore) tiene h-full, este div llenará el espacio.
    */
    <div style={{ width: '100%', height: '100%', position: 'relative', outline: 'none' }} aria-label="Map of businesses">
      <Map
        // Use userLocation if available, otherwise fall back to initialCenter
        center={userLocation || initialCenter}
        defaultZoom={15} // Keep defaultZoom for initial zoom level
        mapId={mapId}
        
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        
        gestureHandling="greedy"
        disableDefaultUI={true}
        
        zoomControl={false}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
      >
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <UserMarker 
            position={userLocation} 
          />
        )}
        {/* Marcadores de negocios */}
        {businesses.map((b) => (
          <BusinessMarker
            key={b.id}
            business={b}
            selected={selectedBusiness?.id === b.id}
            onSelect={onSelectBusiness}
          />
        ))}
      </Map>
    </div>
  );
};