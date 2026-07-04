import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PlaceResult } from '@/services/gemini';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapVisualizationProps {
  places: PlaceResult[];
}

function MapBounds({ places }: { places: PlaceResult[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (places.length === 0) return;
    
    // Calculate bounds
    let hasValidCoords = false;
    const bounds = L.latLngBounds([]);
    
    places.forEach(place => {
      if (place.lat && place.lng && !isNaN(place.lat) && !isNaN(place.lng)) {
        bounds.extend([place.lat, place.lng]);
        hasValidCoords = true;
      }
    });

    if (hasValidCoords && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);

  return null;
}

export function MapVisualization({ places }: MapVisualizationProps) {
  // Center defaults to somewhere if no valid coordinates
  const defaultCenter: [number, number] = [0, 0];
  
  const validPlaces = places.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng));

  if (validPlaces.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <p className="text-gray-500 font-medium">No map locations available for these results.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-6 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={2} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validPlaces.map((place, idx) => (
          <Marker key={`${place.name}-${idx}`} position={[place.lat!, place.lng!]}>
            <Popup>
              <div className="text-sm font-sans min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-1">{place.name}</h3>
                {place.businessCategory && place.businessCategory !== 'N/A' && (
                  <p className="text-xs text-blue-600 font-medium mb-1">{place.businessCategory}</p>
                )}
                <p className="text-xs text-gray-600 mb-2">{place.address}</p>
                <div className="flex items-center gap-2 text-xs">
                  {place.rating !== 'N/A' && <span className="font-medium">⭐ {place.rating}</span>}
                  {place.phone !== 'N/A' && <span>📞 {place.phone}</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapBounds places={validPlaces} />
      </MapContainer>
    </div>
  );
}
