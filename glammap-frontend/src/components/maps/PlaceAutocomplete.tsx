// src/components/maps/PlaceAutocomplete.tsx
import React, { useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

export const PlaceAutocomplete = ({ onPlaceSelect }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ['geometry', 'name', 'formatted_address'],
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'ar' }
    });

    const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            onPlaceSelect(place);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        } else {
            onPlaceSelect(null);
        }
    });

    return () => {
        listener.remove();
    }
  }, [places, onPlaceSelect]);

  return (
    <div className="w-full relative pointer-events-auto group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-cyan-400 transition-colors">search</span>
      <input
        ref={inputRef}
        type="text"
        className="w-full bg-slate-900/80 backdrop-blur-2xl text-white border border-white/10 rounded-3xl py-4 pl-12 pr-6 focus:ring-2 ring-cyan-500/50 outline-none font-medium text-sm shadow-2xl transition-all placeholder:text-slate-500"
        placeholder="Buscar salón, barrio o ciudad..."
        aria-label="Search for a location or business"
      />
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity pointer-events-none" />
    </div>
  );
};
