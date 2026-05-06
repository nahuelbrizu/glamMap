import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export const MapHandler = ({ selectedBusiness }: { selectedBusiness: any }) => {
  const map = useMap(); // Accede a la instancia real del mapa de Google

  useEffect(() => {
    if (map && selectedBusiness) {
      // Cuando seleccionas un negocio, el mapa se centra suavemente
      map.panTo(selectedBusiness.position);
      map.setZoom(15); 
    }
  }, [map, selectedBusiness]);

  return null; // Este componente no renderiza nada visual
};