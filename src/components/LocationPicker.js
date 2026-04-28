'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FiMapPin, FiCrosshair } from 'react-icons/fi';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

export default function LocationPicker({ onLocationSelect, initialPos = [28.6139, 77.2090] }) {
  const [position, setPosition] = useState(initialPos);
  const [address, setAddress] = useState('Fetching location...');
  const [L, setL] = useState(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      // Fix marker icon issue in Leaflet
      delete leaflet.default.Icon.Default.prototype._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.display_name;
      setAddress(addr);
      onLocationSelect({ lat, lng, address: addr });
    } catch (err) {
      console.error(err);
    }
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      });
    }
  };

  if (!L) return <div className="h-[300px] w-full bg-slate-100 rounded-2xl animate-pulse"></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <FiMapPin className="text-fb-blue" /> Pin Delivery Location
        </label>
        <button 
          onClick={handleGetCurrentLocation}
          className="text-[10px] font-black text-fb-blue uppercase tracking-widest flex items-center gap-1 hover:underline"
        >
          <FiCrosshair /> Use Current Location
        </button>
      </div>
      
      <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
          <MapEvents />
        </MapContainer>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Selected Address:</p>
        <p className="text-xs font-black text-slate-700 leading-relaxed">{address}</p>
      </div>
      
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    </div>
  );
}
