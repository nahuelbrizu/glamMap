import { useState, useEffect, useCallback } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import { businessService, type Business } from '../api/services/business.service';

const INITIAL_CENTER = { lat: -34.658, lng: -58.665 };

const PLACE_TYPES_BY_FILTER: Record<string, string[]> = {
  Todos: ['beauty_salon', 'hair_care', 'spa', 'barber_shop'],
  Barbería: ['barber_shop', 'hair_care'],
  Peluquería: ['hair_salon', 'hair_care', 'beauty_salon'],
  Uñas: ['nail_salon', 'beauty_salon'],
  Estética: ['spa', 'beauty_salon'],
};

export const useExploreLogic = () => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setUserLocation(INITIAL_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(INITIAL_CENTER)
    );
  }, []);

  const handleCenterOnUser = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        map?.panTo(coords);
        map?.setZoom(15);
      },
      () => {
        alert('Could not get your location. Please enable location services.');
        if (!userLocation) setUserLocation(INITIAL_CENTER);
      }
    );
  };

  const searchInGoogle = useCallback(
    async (coords: { lat: number; lng: number }, filter: string): Promise<Business[]> => {
      if (!placesLibrary) return [];

      const types = PLACE_TYPES_BY_FILTER[filter] ?? ['beauty_salon'];

      try {
        const { Place } = placesLibrary as { Place?: { searchNearby?: (r: unknown) => Promise<{ places: unknown[] }> } };

        if (Place?.searchNearby) {
          const { places } = await Place.searchNearby({
            locationRestriction: { center: coords, radius: 3000 },
            fields: ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'photos', 'formattedAddress', 'businessStatus'],
            includedTypes: types,
            maxResultCount: 20,
          });

          return (places as Array<Record<string, unknown>>).map(place => ({
            id: place['id'] as string,
            name: place['displayName'] as string,
            address: (place['formattedAddress'] as string) || 'Dirección no disponible',
            position: {
              lat: typeof (place['location'] as { lat?: unknown })?.lat === 'function'
                ? ((place['location'] as { lat: () => number }).lat)()
                : coords.lat,
              lng: typeof (place['location'] as { lng?: unknown })?.lng === 'function'
                ? ((place['location'] as { lng: () => number }).lng)()
                : coords.lng,
            },
            rating_avg: (place['rating'] as number) || 0,
            banner_url: Array.isArray(place['photos']) && (place['photos'] as Array<{ getURI: (o: object) => string }>).length > 0
              ? (place['photos'] as Array<{ getURI: (o: object) => string }>)[0]!.getURI({ maxHeight: 400, maxWidth: 400 })
              : 'https://via.placeholder.com/400x300?text=Sin+Foto',
            category: filter,
          }));
        }
      } catch (err: unknown) {
        console.error('Google Places error:', (err as Error).message ?? err);
      }

      return [];
    },
    [placesLibrary]
  );

  const { data: businesses = [], isLoading: loading } = useQuery<Business[]>({
    queryKey: ['businesses', userLocation, activeFilter],
    queryFn: async () => {
      if (!userLocation) return [];
      try {
        const data = await businessService.exploreMap({
          lat: userLocation.lat,
          lng: userLocation.lng,
          category: activeFilter,
        });
        if (data.length > 0) return data;
        return searchInGoogle(userLocation, activeFilter);
      } catch {
        return searchInGoogle(userLocation, activeFilter);
      }
    },
    enabled: !!userLocation && !!placesLibrary,
  });

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (!place?.geometry?.location || !map) return;
    const newPos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    map.panTo(newPos);
    map.setZoom(15);
    setUserLocation(newPos);
  };

  return {
    businesses,
    activeFilter,
    setActiveFilter,
    userLocation,
    selectedBusiness,
    setSelectedBusiness,
    loading,
    handleCenterOnUser,
    handlePlaceSelect,
    INITIAL_CENTER,
  };
};
