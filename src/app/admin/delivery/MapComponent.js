'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let deliveryIcon = null;
let customerIcon = null;

// Initialize icons only once on client side
const initializeIcons = () => {
  if (typeof window !== 'undefined' && !deliveryIcon) {
    // Fix for default marker icons in Leaflet with Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Custom Icon for Delivery Partner
    deliveryIcon = new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35]
    });

    // Custom Icon for Customer Location
    customerIcon = new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35]
    });
  }
  return { deliveryIcon, customerIcon };
};

export default function MapComponent({ assignments }) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef(null);
  
  useEffect(() => {
    setIsClient(true);
    initializeIcons();
  }, []);

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const zoomLevel = assignments.length > 0 ? 12 : 5;

  // Use the first assignment's location to center the map if available
  const center = assignments.length > 0 && assignments[0].partner && assignments[0].partner.lat 
    ? [assignments[0].partner.lat, assignments[0].partner.lng] 
    : defaultCenter;

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl">
        <div className="animate-spin w-8 h-8 border-4 border-fk-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const icons = initializeIcons();

  // Function to geocode customer address (simplified - using approximate coordinates for demo)
  const getCustomerCoordinates = (address) => {
    // This is a simplified version - in production, you'd use a geocoding API
    // For now, we'll use some common Indian city coordinates as examples
    const cityCoordinates = {
      'delhi': [28.6139, 77.2090],
      'mumbai': [19.0760, 72.8777],
      'bangalore': [12.9716, 77.5946],
      'hyderabad': [17.3850, 78.4867],
      'chennai': [13.0827, 80.2707],
      'kolkata': [22.5726, 88.3639],
      'pune': [18.5204, 73.8567],
      'lucknow': [26.8467, 80.9462],
      'jaipur': [26.9124, 75.7873],
      'ahmedabad': [23.0225, 72.5714]
    };

    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (addressLower.includes(city)) {
        return coords;
      }
    }
    
    // Default to Delhi if no match found
    return [28.6139, 77.2090];
  };

  return (
    <div className="w-full h-full">
      <MapContainer 
        ref={mapRef}
        center={center} 
        zoom={zoomLevel} 
        className="w-full h-full" 
        scrollWheelZoom={true}
        whenCreated={(map) => {
          // Store map instance if needed
          if (mapRef.current) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {assignments.map(a => {
          const markers = [];
          
          // Delivery Boy Marker
          if (a.partner && a.partner.lat && a.partner.lng && icons.deliveryIcon) {
            markers.push(
              <Marker key={`delivery-${a.id}`} position={[a.partner.lat, a.partner.lng]} icon={icons.deliveryIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-blue-600">🏍️ Delivery Boy</p>
                    <p className="text-sm">{a.partner.name || 'Unknown Partner'}</p>
                    <p className="text-xs">{a.status.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-[#fb641b]">Order: #{a.order?.order_number || 'N/A'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          
          // Customer Location Marker
          const customerAddress = a.assignment_type === 'pickup' 
            ? 'Central Hub sorting center, Delhi'
            : `${a.order?.shipping_address}, ${a.order?.shipping_city} - ${a.order?.shipping_pincode}`;
          
          const customerCoords = getCustomerCoordinates(customerAddress);
          
          if (icons.customerIcon) {
            markers.push(
              <Marker key={`customer-${a.id}`} position={customerCoords} icon={icons.customerIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-red-600">📍 Customer</p>
                    <p className="text-sm">{a.assignment_type === 'pickup' ? 'Central Hub' : (a.order?.shipping_name || 'Customer')}</p>
                    <p className="text-xs text-gray-600">{customerAddress}</p>
                    <p className="text-xs text-[#fb641b]">Order: #{a.order?.order_number || 'N/A'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          
          return markers;
        })}
      </MapContainer>
    </div>
  );
}
