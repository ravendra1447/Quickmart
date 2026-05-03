'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Delivery Partner
const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

export default function MapComponent({ assignments }) {
  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const zoomLevel = assignments.length > 0 ? 12 : 5;

  // Use the first assignment's location to center the map if available
  const center = assignments.length > 0 && assignments[0].partner && assignments[0].partner.lat 
    ? [assignments[0].partner.lat, assignments[0].partner.lng] 
    : defaultCenter;

  return (
    <MapContainer center={center} zoom={zoomLevel} className="w-full h-full" scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {assignments.map(a => {
        if (a.partner && a.partner.lat && a.partner.lng) {
          return (
            <Marker key={a.id} position={[a.partner.lat, a.partner.lng]} icon={deliveryIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">{a.partner.name || 'Unknown Partner'}</p>
                  <p className="text-xs">{a.status.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-xs text-[#fb641b]">Order: #{a.order?.order_number || 'N/A'}</p>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
