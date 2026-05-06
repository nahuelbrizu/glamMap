import { useState, useEffect, useCallback } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const INITIAL_CENTER = { lat: -34.658, lng: -58.665 };

// Type definition for a business object
interface Business {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating_avg: number;
  user_ratings_total: number;
  logo_url: string;
  category: string;
  isOpen: boolean;
  isGoogleResult: boolean;
}

export const useExploreLogic = () => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Set initial location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          console.warn('Geolocation denied or failed, using initial center.');
          setUserLocation(INITIAL_CENTER);
        }
      );
    } else {
      setUserLocation(INITIAL_CENTER);
    }
  }, []);

  const handleCenterOnUser = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        if (map) {
          map.panTo(coords);
          map.setZoom(15);
        }
      },
      () => {
        alert('Could not get your location. Please enable location services.');
        if (!userLocation) {
          setUserLocation(INITIAL_CENTER);
        }
      }
    );
  };

  const getGooglePlaceType = (filter: string): string[] => {
    const categories: Record<string, string[]> = {
      'Todos': ['beauty_salon', 'hair_care', 'spa', 'barber_shop'],
      'Barbería': ['barber_shop', 'hair_care'],
      'Peluquería': ['hair_salon', 'hair_care', 'beauty_salon'],
      'Uñas': ['nail_salon', 'beauty_salon'],
      'Estética': ['spa', 'beauty_salon'],
    };
    return categories[filter] || ['beauty_salon'];
  };

  const searchInGoogle = useCallback(
    async (coords: { lat: number; lng: number }, filter: string): Promise<Business[]> => {
      if (!placesLibrary) return [];

      const request = {
        locationRestriction: {
          center: { lat: coords.lat, lng: coords.lng },
          radius: 3000,
        },
        fields: ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'photos', 'formattedAddress', 'businessStatus'],
        includedTypes: getGooglePlaceType(filter),
        maxResultCount: 20,
      };

      try {
        const { Place } = placesLibrary as any;
        
        if (Place && Place.searchNearby) {
          // Usa Places API V2
          const { places } = await Place.searchNearby(request);
          console.log("Google Places (V2) Response:", places?.length || 0, "results found.");
          if (places) {
            return places.map((place: any): Business => ({
              id: place.id,
              name: place.displayName,
              address: place.formattedAddress || 'Dirección no disponible',
              location: {
                lat: typeof place.location?.lat === 'function' ? place.location.lat() : coords.lat,
                lng: typeof place.location?.lng === 'function' ? place.location.lng() : coords.lng,
              },
              rating_avg: place.rating || 0,
              user_ratings_total: place.userRatingCount || 0,
              logo_url: place.photos && place.photos.length > 0
                ? place.photos[0].getURI({ maxHeight: 400, maxWidth: 400 })
                : 'https://via.placeholder.com/400x300?text=Sin+Foto',
              category: filter,
              isOpen: place.businessStatus === 'OPERATIONAL',
              isGoogleResult: true,
            }));
          }
        } else {
          // Fallback a Places API V1 (Legacy)
          console.warn("Using Google Places V1 (Legacy) as V2 is not available.");
          return new Promise((resolve) => {
            const mapDiv = document.createElement('div');
            const service = new google.maps.places.PlacesService(mapDiv);
            service.nearbySearch(
              {
                location: coords,
                radius: 3000,
                type: getGooglePlaceType(filter)[0] // nearbySearch solo acepta un type principal a veces, o usamos keyword
              },
              (results, status) => {
                console.log("Google Places (V1) Response Status:", status, "Results:", results?.length || 0);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  resolve(
                    results.map((place: any): Business => ({
                      id: place.place_id,
                      name: place.name,
                      address: place.vicinity || 'Dirección no disponible',
                      location: {
                        lat: typeof place.geometry?.location?.lat === 'function' ? place.geometry.location.lat() : coords.lat,
                        lng: typeof place.geometry?.location?.lng === 'function' ? place.geometry.location.lng() : coords.lng,
                      },
                      rating_avg: place.rating || 0,
                      user_ratings_total: place.user_ratings_total || 0,
                      logo_url: place.photos && place.photos.length > 0
                        ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 })
                        : 'https://via.placeholder.com/400x300?text=Sin+Foto',
                      category: filter,
                      isOpen: place.business_status === 'OPERATIONAL',
                      isGoogleResult: true,
                    }))
                  );
                } else {
                  resolve([]);
                }
              }
            );
          });
        }
        return [];
      } catch (error: any) {
        console.error('Error searching in Google Places:', error.message || error);
        return [];
      }
    },
    [placesLibrary]
  );

  const { data: businesses = [], isLoading: loading } = useQuery<Business[]>({
    queryKey: ['businesses', userLocation, activeFilter],
    queryFn: async () => {
      if (!userLocation) return [];

      try {
        const { data: myData } = await api.get('/users/explore-map', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            category: activeFilter,
          },
        });

        if (myData && myData.length > 0) {
          return myData;
        } else {
          return await searchInGoogle(userLocation, activeFilter);
        }
      } catch (error) {
        console.error('Error fetching from API, falling back to Google:', error);
        return await searchInGoogle(userLocation, activeFilter);
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
