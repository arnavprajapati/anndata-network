import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";

const containerStyle = { width: "100%", height: "75vh" };
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi - fallback

export default function MapPreviewSection() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // libraries: ['places'] // uncomment if needed
  });

  const [donations, setDonations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const socketRef = useRef(null);

  // Fetch initial donations from REST API
  const fetchInitialDonations = async (baseUrl) => {
    try {
      const res = await fetch(`${baseUrl}/api/donations/live`);
      if (res.ok) {
        const json = await res.json();
        console.log("📍 Fetched initial donations:", json);
        // Transform MongoDB _id to id for consistency
        const transformedDonations = json.map((d) => ({
          ...d,
          id: d._id || d.id,
          position: d.location || { lat: 28.6139, lng: 77.2090 },
          title: d.foodType || "Food Donation",
          qty: d.quantity || 0,
          updatedAt: d.updatedAt || Date.now(),
        }));
        setDonations(transformedDonations);
      }
    } catch (e) {
      console.warn("⚠️ Could not fetch initial donations:", e.message);
      // Try with relative path as fallback
      try {
        const res = await fetch("/api/donations/live");
        if (res.ok) {
          const json = await res.json();
          const transformedDonations = json.map((d) => ({
            ...d,
            id: d._id || d.id,
            position: d.location || { lat: 28.6139, lng: 77.2090 },
            title: d.foodType || "Food Donation",
            qty: d.quantity || 0,
            updatedAt: d.updatedAt || Date.now(),
          }));
          setDonations(transformedDonations);
        }
      } catch (e2) {
        console.warn("⚠️ Relative path also failed:", e2.message);
      }
    }
  };

  // initialize socket and listeners
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SOCKET_IO_SERVER || "http://localhost:4000";
    console.log("🔌 Connecting to Socket.IO server at:", serverUrl);
    const socket = io(serverUrl, { transports: ["websocket", "polling"] }); // auto reconnect
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
      // Fetch initial donations when connected
      fetchInitialDonations(serverUrl);
    });

    socket.on("donations-update", (data) => {
      console.log("📡 Received donations-update:", data);
      // data should be an array of donation objects
      setDonations(Array.isArray(data) ? data : []);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const onMarkerClick = useCallback((id) => setSelectedId(id), []);
  const onMapClick = useCallback(() => setSelectedId(null), []);

  const selected = useMemo(() => donations.find(d => d.id === selectedId), [donations, selectedId]);

  if (loadError) return <div>Map failed to load.</div>;

  return (
    <section id="map" style={{ padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 12 }}>Live Map Preview (Realtime via Socket.IO)</h2>
        <p style={{ color: "#666", marginBottom: 12 }}>
          {donations.length > 0 ? `${donations.length} donation(s) available` : "No donations available"}
        </p>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={donations.length ? donations[0].position : defaultCenter}
            zoom={12}
            onClick={onMapClick}
            options={{
              disableDefaultUI: false,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              styles: [] // insert JSON map style if you want
            }}
          >
            {donations.map(d => (
              <Marker
                key={d.id}
                position={d.position}
                onClick={() => onMarkerClick(d.id)}
                // keep icon simple to avoid window.google dependencies before load
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                }}
              />
            ))}

            {selected && (
              <InfoWindowF position={selected.position} onCloseClick={() => setSelectedId(null)}>
                <div style={{ minWidth: 200 }}>
                  <strong>{selected.title}</strong>
                  <div>Quantity: {selected.qty}</div>
                  <div>Updated: {new Date(selected.updatedAt).toLocaleTimeString()}</div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => alert(JSON.stringify(selected, null, 2))}
                      style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer", border: "none", background: "#1976d2", color: "#fff" }}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </InfoWindowF>
            )}

          </GoogleMap>
        ) : (
          <div style={{ height: "75vh", display: "grid", placeItems: "center", color: "#666" }}>
            Loading map…
          </div>
        )}
      </div>
    </section>
  );
}
