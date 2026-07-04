"use client";
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Search, Maximize2, Trash2, Sliders, HelpCircle, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
// Modern SVG Marker icon to avoid Leaflet marker asset resolution bugs in Vite
const markerIconSvg = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping duration-1000"></div>
    <div class="relative w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
  </div>`,
  className: 'custom-leaflet-marker-pink',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const cornerIconSvg = L.divIcon({
  html: `<div class="w-4 h-4 bg-cyan-500 border-2 border-white rounded-full shadow-md"></div>`,
  className: 'custom-leaflet-marker-corner',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export interface LocationFilterData {
  type: 'radius' | 'bounding_box' | 'multi_city';
  center?: { lat: number; lng: number; address?: string };
  radiusKm?: number;
  boundingBox?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
}

interface LocationMapProps {
  value?: LocationFilterData;
  onChange: (value: LocationFilterData | undefined) => void;
}

export function LocationMap({ value, onChange }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const rectRef = useRef<L.Rectangle | null>(null);
  const cornerMarkersRef = useRef<L.Marker[]>([]);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>('');

  // Mode selection state
  const [filterType, setFilterType] = useState<'radius' | 'bounding_box' | 'multi_city'>('radius');
  const filterTypeRef = useRef<'radius' | 'bounding_box' | 'multi_city'>('radius');

  useEffect(() => {
    filterTypeRef.current = filterType;
  }, [filterType]);
  
  // Radius state
  const [radius, setRadius] = useState(10); // default 10 km
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({ lat: 24.7136, lng: 46.6753 }); // default Riyadh
  
  // Bounding box draw state
  const [boxStart, setBoxStart] = useState<{ lat: number; lng: number } | null>(null);
  const [boxEnd, setBoxEnd] = useState<{ lat: number; lng: number } | null>(null);

  // Synchronize state from parent if initialized
  useEffect(() => {
    if (value) {
      setFilterType(value.type);
      if (value.type === 'radius' && value.center) {
        setCenterCoords({ lat: value.center.lat, lng: value.center.lng });
        if (value.radiusKm) setRadius(value.radiusKm);
        if (value.center.address) setResolvedAddress(value.center.address);
      } else if (value.type === 'bounding_box' && value.boundingBox) {
        setBoxStart(value.boundingBox.southWest);
        setBoxEnd(value.boundingBox.northEast);
      }
    }
  }, []);

  // Initialize leafet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet map instance centered over Riyadh/Middle East region or current center
    const initialLat = value?.center?.lat || centerCoords.lat;
    const initialLng = value?.center?.lng || centerCoords.lng;

    const leafletMap = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 11,
      zoomControl: true,
      maxZoom: 18,
      minZoom: 2,
    });

    // Add clean modern design styled Map tiles (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    // Listen for map click to place markers or define coordinates
    leafletMap.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Store current filter type from ref-like state or local state
      // Reading state inside event listener requires using react states or helper variables
      const currentMode = filterTypeRef.current;
      
      if (currentMode === 'radius') {
        setCenterCoords({ lat, lng });
        // Retrieve approximate town name/coords description via Nominatim reverse lookup
        fetchAddressName(lat, lng);
      } else {
        // Bounding box mode drafting
        leafletMap.fire('box_mode_click', { lat, lng });
      }
    });

    return () => {
      leafletMap.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Box mode clicks in a custom event listener
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleBoxClick = (e: any) => {
      const { lat, lng } = e;
      setBoxStart(prevStart => {
        if (!prevStart) {
          // Setting SW corner
          setBoxEnd(null);
          return { lat, lng };
        } else {
          // SW already exists, setting border end (NE)
          setBoxEnd({ lat, lng });
          return prevStart;
        }
      });
    };

    map.on('box_mode_click', handleBoxClick);
    return () => {
      map.off('box_mode_click', handleBoxClick);
    };
  }, []);

  // Look up address name for coords on reverse search
  const fetchAddressName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
      const data = await res.json();
      if (data && data.display_name) {
        // Strip long full displays to shorter visual address
        const parts = data.display_name.split(',');
        const shortAddr = parts.slice(0, 3).join(',').trim();
        setResolvedAddress(shortAddr);
        triggerChange('radius', { lat, lng }, radius, shortAddr);
      } else {
        const fallback = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setResolvedAddress(fallback);
        triggerChange('radius', { lat, lng }, radius, fallback);
      }
    } catch {
      const fallback = `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setResolvedAddress(fallback);
      triggerChange('radius', { lat, lng }, radius, fallback);
    }
  };

  // Perform nominatim geocoding on address searches
  const handleAddressSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',').slice(0, 3).join(',').trim();
        
        setCenterCoords({ lat, lng });
        setResolvedAddress(displayName);
        mapRef.current.setView([lat, lng], 13);
        
        if (filterType === 'radius') {
          triggerChange('radius', { lat, lng }, radius, displayName);
        } else {
          // Reset box placement with new focused center
          setBoxStart({ lat: lat - 0.02, lng: lng - 0.03 });
          setBoxEnd({ lat: lat + 0.02, lng: lng + 0.03 });
        }
      } else {
        toast.error('Location not found. Try searching for city name or specific locality.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const triggerChange = (
    type: 'radius' | 'bounding_box',
    centerPt?: { lat: number; lng: number },
    radiusVal?: number,
    addressStr?: string,
    currentBox?: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }
  ) => {
    if (type === 'radius' && centerPt) {
      onChange({
        type: 'radius',
        center: { lat: centerPt.lat, lng: centerPt.lng, address: addressStr || resolvedAddress },
        radiusKm: radiusVal || radius,
      });
    } else if (type === 'bounding_box' && currentBox) {
      onChange({
        type: 'bounding_box',
        boundingBox: {
          northEast: currentBox.ne,
          southWest: currentBox.sw,
        },
      });
    }
  };

  // Redraw overlays whenever states update reactivity
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clean up older graphics
    if (markerRef.current) markerRef.current.remove();
    if (circleRef.current) circleRef.current.remove();
    if (rectRef.current) rectRef.current.remove();
    cornerMarkersRef.current.forEach(m => m.remove());
    cornerMarkersRef.current = [];

    if (filterType === 'radius') {
      // Draw center marker
      markerRef.current = L.marker([centerCoords.lat, centerCoords.lng], {
        icon: markerIconSvg,
        draggable: true
      }).addTo(map);

      // Listen for marker drag to recalculate coordinates
      markerRef.current.on('dragend', () => {
        if (markerRef.current) {
          const latlng = markerRef.current.getLatLng();
          setCenterCoords({ lat: latlng.lat, lng: latlng.lng });
          fetchAddressName(latlng.lat, latlng.lng);
        }
      });

      // Draw radius circle
      // radius values in leaflet are defined in meters
      circleRef.current = L.circle([centerCoords.lat, centerCoords.lng], {
        radius: radius * 1000,
        color: '#9333ea', // blue-600
        fillColor: '#805ad5',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4'
      }).addTo(map);

    } else if (filterType === 'bounding_box') {
      // If we have either box points, draw markers or preview rectangle
      if (boxStart && boxEnd) {
        const swLat = Math.min(boxStart.lat, boxEnd.lat);
        const swLng = Math.min(boxStart.lng, boxEnd.lng);
        const neLat = Math.max(boxStart.lat, boxEnd.lat);
        const neLng = Math.max(boxStart.lng, boxEnd.lng);

        const bounds = L.latLngBounds([swLat, swLng], [neLat, neLng]);

        rectRef.current = L.rectangle(bounds, {
          color: '#06b6d4', // cyan-500
          fillColor: '#06b6d4',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);

        // Add visual corner markers for clarity
        const swMarker = L.marker([swLat, swLng], { icon: cornerIconSvg, draggable: true }).addTo(map);
        const neMarker = L.marker([neLat, neLng], { icon: cornerIconSvg, draggable: true }).addTo(map);

        swMarker.on('drag', (e: any) => {
          const currentSw = e.target.getLatLng();
          // live redraw rectangle bounds
          if (rectRef.current) rectRef.current.setBounds(L.latLngBounds([currentSw.lat, currentSw.lng], [neLat, neLng]));
        });

        swMarker.on('dragend', (e: any) => {
          const finishedSw = e.target.getLatLng();
          setBoxStart({ lat: finishedSw.lat, lng: finishedSw.lng });
          triggerChange('bounding_box', undefined, undefined, undefined, {
            sw: { lat: finishedSw.lat, lng: finishedSw.lng },
            ne: { lat: neLat, lng: neLng }
          });
        });

        neMarker.on('drag', (e: any) => {
          const currentNe = e.target.getLatLng();
          if (rectRef.current) rectRef.current.setBounds(L.latLngBounds([swLat, swLng], [currentNe.lat, currentNe.lng]));
        });

        neMarker.on('dragend', (e: any) => {
          const finishedNe = e.target.getLatLng();
          setBoxEnd({ lat: finishedNe.lat, lng: finishedNe.lng });
          triggerChange('bounding_box', undefined, undefined, undefined, {
            sw: { lat: swLat, lng: swLng },
            ne: { lat: finishedNe.lat, lng: finishedNe.lng }
          });
        });

        cornerMarkersRef.current = [swMarker, neMarker];
      } else if (boxStart) {
        // Just draw a lone start anchor for visual assistance
        const anchor = L.marker([boxStart.lat, boxStart.lng], { icon: cornerIconSvg }).addTo(map);
        cornerMarkersRef.current = [anchor];
      }
    }
  }, [filterType, centerCoords, radius, boxStart, boxEnd]);

  // Handle radius slide adjustments
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const km = Number(e.target.value);
    setRadius(km);
    triggerChange('radius', centerCoords, km);
  };

  // Reset/Clear full filter options
  const handleReset = () => {
    setBoxStart(null);
    setBoxEnd(null);
    setResolvedAddress('');
    onChange(undefined);
  };

  // Quick preset focusing cities to speed up regional GTM workflows
  const quickLocPreset = (city: string, lat: number, lng: number) => {
    setCenterCoords({ lat, lng });
    setResolvedAddress(city);
    setBoxStart(null);
    setBoxEnd(null);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 12);
    }
    if (filterType === 'radius') {
      triggerChange('radius', { lat, lng }, radius, city);
    } else {
      setBoxStart({ lat: lat - 0.02, lng: lng - 0.03 });
      setBoxEnd({ lat: lat + 0.02, lng: lng + 0.03 });
      triggerChange('bounding_box', undefined, undefined, undefined, {
        sw: { lat: lat - 0.02, lng: lng - 0.03 },
        ne: { lat: lat + 0.02, lng: lng + 0.03 }
      });
    }
  };

  const getActiveFilterStatusText = () => {
    if (filterType === 'radius') {
      return `Radius: ${radius} km around ${resolvedAddress || `${centerCoords.lat.toFixed(3)}, ${centerCoords.lng.toFixed(3)}`}`;
    }
    if (boxStart && boxEnd) {
      return `Bounding Box active: (${Math.min(boxStart.lat, boxEnd.lat).toFixed(3)}, ${Math.min(boxStart.lng, boxEnd.lng).toFixed(3)}) to (${Math.max(boxStart.lat, boxEnd.lat).toFixed(3)}, ${Math.max(boxStart.lng, boxEnd.lng).toFixed(3)})`;
    }
    return 'Click map to place boundaries';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-hidden mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            Precise Location Grounding
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">Narrow scraping radius using official map coordinates.</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setFilterType('radius');
              triggerChange('radius', centerCoords, radius);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterType === 'radius'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Radius (Circle) 🎯
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('bounding_box');
              // Initialize a bounding box to keep things highly responsive
              if (!boxStart || !boxEnd) {
                setBoxStart({ lat: centerCoords.lat - 0.02, lng: centerCoords.lng - 0.03 });
                setBoxEnd({ lat: centerCoords.lat + 0.02, lng: centerCoords.lng + 0.03 });
                triggerChange('bounding_box', undefined, undefined, undefined, {
                  sw: { lat: centerCoords.lat - 0.02, lng: centerCoords.lng - 0.03 },
                  ne: { lat: centerCoords.lat + 0.02, lng: centerCoords.lng + 0.03 }
                });
              } else {
                triggerChange('bounding_box', undefined, undefined, undefined, {
                  sw: boxStart,
                  ne: boxEnd
                });
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterType === 'bounding_box'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Bounding Box (Rectangle) 📐
          </button>
        </div>
      </div>

      {/* Geocoding Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleAddressSearch(e);
              }
            }}
            placeholder="Search address (e.g. Riyadh, Dubai Marina, SOHO London...)"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddressSearch()}
          disabled={isSearching}
          className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
          Locate
        </button>
      </div>

      {/* Leaflet Map Frame */}
      <div 
        ref={mapContainerRef} 
        style={{ height: '240px' }} 
        className="w-full rounded-lg border border-gray-200 shadow-inner z-10" 
      />

      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="text-xs font-semibold text-gray-600 truncate flex items-center gap-1">
          <Eye className="w-4 h-4 text-blue-600" />
          {getActiveFilterStatusText()}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 self-end"
          >
            <Trash2 className="w-3.5 h-3.5" /> Deactivate Location Filter
          </button>
        )}
      </div>

      {/* Auxiliary Settings: Circle Radius Slider */}
      {filterType === 'radius' && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
            <span>Search Radius Constraint:</span>
            <span className="text-blue-700 font-extrabold">{radius} km</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400">1 km</span>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={handleRadiusChange}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-semibold text-gray-400">100 km</span>
          </div>
        </div>
      )}

      {filterType === 'bounding_box' && (
        <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
          <span className="text-cyan-500 font-bold text-xs mt-0.5">💡</span>
          <p>
            <strong>Bounding box interactive shortcut:</strong> Click anywhere on the map to set the South-West corner (minimum boundary), and click a second location to mark the North-East edge (maximum boundary) or drag the corner pins to resize dynamically.
          </p>
        </div>
      )}

      {/* Quick Regions Presets (Common hubs to boost user conversions & test easily) */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="text-xs font-bold text-gray-500 uppercase mb-2">🚀 Try quick hubs:</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => quickLocPreset('Riyadh', 24.7136, 46.6753)}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-semibold transition-colors border border-blue-100/50"
          >
            Riyadh 🇸🇦
          </button>
          <button
            type="button"
            onClick={() => quickLocPreset('Cairo', 30.0444, 31.2357)}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-semibold transition-colors border border-blue-100/50"
          >
            Cairo 🇪🇬
          </button>
          <button
            type="button"
            onClick={() => quickLocPreset('Dubai', 25.2048, 55.2708)}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md text-[11px] font-semibold transition-colors border border-amber-100/50"
          >
            Dubai 🇦🇪
          </button>
          <button
            type="button"
            onClick={() => quickLocPreset('London', 51.5074, -0.1278)}
            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md text-[11px] font-semibold transition-colors border border-cyan-100/50"
          >
            London 🇬🇧
          </button>
          <button
            type="button"
            onClick={() => quickLocPreset('San Francisco', 37.7749, -122.4194)}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-semibold transition-colors border border-emerald-100/50"
          >
            San Francisco 🇺🇸
          </button>
        </div>
      </div>
    </div>
  );
}
