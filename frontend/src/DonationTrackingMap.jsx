import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { Truck, MapPin, Navigation } from "lucide-react";

const ngoIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const donorIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeMapView({ coords }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (coords && coords.length > 0) {
      // Calculate bounds
      const bounds = L.latLngBounds(coords);
      
      if (bounds.isValid() && coords.length > 1) {
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 
        });
      }
    }
  }, [coords, map]);
  
  return null;
}


function DonationTrackingMap({ donorLocation, ngoLocation }) {
  const dLat = Number(donorLocation?.lat);
  const dLng = Number(donorLocation?.lng);
  const nLat = Number(ngoLocation?.lat);
  const nLng = Number(ngoLocation?.lng);
  
  // Safety check for valid coordinates
  if (
    !dLat || !dLng || !nLat || !nLng || 
    isNaN(dLat) || isNaN(dLng) || isNaN(nLat) || isNaN(nLng)
  ) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-semibold">Waiting for valid coordinates</p>
          <p className="text-sm text-gray-500 mt-2">NGO will start tracking once accepted</p>
        </div>
      </div>
    );
  }

  const path = [
    [dLat, dLng],
    [nLat, nLng],
  ];

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance(nLat, nLng, dLat, dLng);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-md border border-gray-200 relative">
      <MapContainer
        center={[(dLat + nLat) / 2, (dLng + nLng) / 2]} 
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: '#f5f5f5' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="map-tiles"
        />

        <Marker position={[nLat, nLng]} icon={ngoIcon}>
          <Popup>
            <div className="text-center p-2">
              <Truck className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="font-bold text-gray-800">NGO Vehicle</p>
              <p className="text-sm text-gray-600 mt-1">Status: On The Way</p>
              <p className="text-xs text-gray-500 mt-2">
                📍 {nLat.toFixed(4)}, {nLng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        <Marker position={[dLat, dLng]} icon={donorIcon}>
          <Popup>
            <div className="text-center p-2">
              <MapPin className="w-6 h-6 mx-auto text-red-600 mb-2" />
              <p className="font-bold text-gray-800">Your Location</p>
              <p className="text-sm text-gray-600 mt-1">Pickup Point</p>
              {donorLocation.text && (
                <p className="text-xs text-gray-500 mt-2">{donorLocation.text}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                📍 {dLat.toFixed(4)}, {dLng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        <Polyline 
          positions={path} 
          color={nLat === dLat && nLng === dLng ? "#9ca3af" : "#3b82f6"} 
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />

        <ChangeMapView coords={path} />
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] border border-gray-200">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-lg font-bold text-blue-600">{distance} km</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Legend</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">NGO Vehicle</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Your Location</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-green-500 p-2 rounded-full shadow-lg z-[1000] animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
}

export default DonationTrackingMap;