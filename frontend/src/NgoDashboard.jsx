import React, { useState, useEffect, useCallback } from 'react';
import { Map, Package, Clock, Truck, CheckCircle, LocateFixed, Users, RefreshCw, MapPin, Navigation, TrendingUp, Award, Target, Activity, Heart, X } from 'lucide-react';
import { PRIMARY_RED, DARK_CHARCOAL, MessageDisplay, API_BASE_URL } from './Shared';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import DonationTrackingMap from './DonationTrackingMap'; // Reuse the tracking map component

// Custom Icons for Map
const ngoIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const donorIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- Components ---

const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className={`${bgColor} border-l-4 rounded-xl p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1`} style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-bold mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black" style={{ color: color }}>{value}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-semibold mt-1">{subtitle}</p>}
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-8 h-8" style={{ color: color }} />
            </div>
        </div>
    </div>
);

// NGO specific Map Modal for individual tracking
const TrackingModal = ({ donation, ngoLocation, onClose }) => {
    if (!donation) return null;
    
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-in zoom-in duration-200">
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Pickup Route: {donation.foodType}</h2>
                        <p className="text-xs font-bold text-blue-600">Donor: {donation.donorId?.name || 'User'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="w-full h-[450px] rounded-xl overflow-hidden border border-gray-200">
                        <DonationTrackingMap 
                            donorLocation={donation.location} 
                            ngoLocation={ngoLocation} 
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs font-black uppercase text-gray-500">
                        <span className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div> You</span>
                        <Truck className="w-4 h-4 animate-bounce text-green-600" />
                        <span className="flex items-center"><div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div> Destination</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main NGO Dashboard
const NgoDashboard = ({ onLogout }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingDonations, setPendingDonations] = useState([]);
    const [acceptedDonations, setAcceptedDonations] = useState([]);
    const [ngoLocation, setNgoLocation] = useState({ lat: null, lng: null });
    const [selectedForTracking, setSelectedForTracking] = useState(null);
    const [message, setMessage] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackingDonationId, setTrackingDonationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const stats = {
        total: acceptedDonations.length,
        pending: pendingDonations.length,
        active: acceptedDonations.filter(d => d.status === 'onTheWay' || d.status === 'accepted').length,
        completed: acceptedDonations.filter(d => d.status === 'picked').length,
    };

    const loadData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        setIsLoading(true);
        try {
            const [pRes, aRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/donations/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/donations/my-accepted`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const pData = await pRes.json();
            const aData = await aRes.json();
            setPendingDonations(pData.donations || []);
            setAcceptedDonations(aData.donations || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setCurrentUser(data.user);
                setNgoLocation(data.user.location?.lat ? data.user.location : { lat: 28.61, lng: 77.20 });
            } else onLogout();
        };
        fetchUser().then(loadData);
    }, [onLogout, loadData]);

    // Live update simulation for "On the Way" donations
    useEffect(() => {
        if (!isTracking || !trackingDonationId) return;
        const interval = setInterval(async () => {
            const token = localStorage.getItem('authToken');
            const newLat = ngoLocation.lat + (Math.random() - 0.5) * 0.0006;
            const newLng = ngoLocation.lng + (Math.random() - 0.5) * 0.0006;
            
            const res = await fetch(`${API_BASE_URL}/api/donations/${trackingDonationId}/update-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ lat: newLat, lng: newLng }),
            });
            if (res.ok) setNgoLocation({ lat: newLat, lng: newLng });
        }, 5000);
        return () => clearInterval(interval);
    }, [isTracking, trackingDonationId, ngoLocation]);

    const handleAccept = async (id) => {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/donations/${id}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { setMessage({ type: 'success', text: 'Pickup Accepted!' }); loadData(); }
    };

    const handlePickupComplete = async (id) => {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/donations/${id}/mark-picked`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { 
            setIsTracking(false); 
            setTrackingDonationId(null); 
            setMessage({ type: 'success', text: 'Collection Complete!' }); 
            loadData(); 
        }
    };

    if (!currentUser) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">SYNCING COMMAND CENTER...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-38 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">NGO Mission Control 🛰️</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{currentUser.name}</p>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer active:scale-90">
                        <RefreshCw className={`w-5 h-5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={Target} title="Nearby" value={stats.pending} color="#F59E0B" bgColor="bg-white" />
                    <StatCard icon={CheckCircle} title="Total" value={stats.total} color="#3B82F6" bgColor="bg-white" />
                    <StatCard icon={Truck} title="Active" value={stats.active} color="#10B981" bgColor="bg-white" />
                    <StatCard icon={Award} title="Verified" value={stats.completed} color="#8B5CF6" bgColor="bg-white" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black mb-6 flex items-center text-gray-800"><Truck className="mr-2 text-blue-600" /> Active Pickups</h2>
                            {acceptedDonations.length === 0 ? (
                                <div className="text-center py-12 opacity-30 font-bold"><Package className="mx-auto mb-2 w-12 h-12" /> No active missions</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {acceptedDonations.map(d => (
                                        <div key={d._id} className="p-5 border-2 rounded-2xl bg-white shadow-sm hover:shadow-md transition border-gray-100">
                                            <div className="flex justify-between mb-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${d.status === 'picked' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{d.status}</span>
                                                <p className="text-[10px] font-black text-gray-400">ID: {d._id.slice(-6)}</p>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-800 mb-1">{d.foodType}</h3>
                                            <p className="text-xs font-bold text-gray-500 mb-4 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {d.location?.text || 'GPS Locked'}</p>
                                            
                                            <div className="space-y-2">
                                                {d.status !== 'picked' && (
                                                    <>
                                                        <button 
                                                            onClick={() => setSelectedForTracking(d)}
                                                            className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg font-black text-xs cursor-pointer hover:bg-blue-200 transition flex items-center justify-center"
                                                        >
                                                            <Map className="w-3 h-3 mr-2" /> VIEW TRACKING MAP
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => { setTrackingDonationId(d._id); setIsTracking(true); }}
                                                                disabled={isTracking && trackingDonationId !== d._id}
                                                                className="flex-1 py-2 bg-gray-800 text-white rounded-lg font-black text-[10px] cursor-pointer hover:bg-black transition disabled:opacity-50"
                                                            >
                                                                {isTracking && trackingDonationId === d._id ? '📡 LIVE' : 'START GPS'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handlePickupComplete(d._id)}
                                                                disabled={d.status !== 'onTheWay'}
                                                                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-black text-[10px] cursor-pointer hover:bg-green-700 transition disabled:opacity-30"
                                                            >
                                                                VERIFY PICKUP
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                                {d.status === 'picked' && (
                                                    <div className="py-2 bg-purple-50 text-purple-700 text-center rounded-lg font-black text-xs">COLLECTION VERIFIED ✓</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-black mb-4 flex items-center text-gray-800 tracking-tight"><Navigation className="mr-2 text-orange-500 w-5 h-5" /> NEW PINGS</h2>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {pendingDonations.map(d => (
                                    <div key={d._id} className="p-4 border-2 border-orange-100 bg-orange-50 rounded-xl hover:translate-x-1 transition cursor-pointer shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-black text-gray-800">{d.foodType}</p>
                                            <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-1 rounded shadow-sm">NEW</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 space-y-1">
                                            <p className="flex items-center"><Users className="w-3 h-3 mr-1" /> {d.donorId?.name || 'Anonymous'}</p>
                                            <p className="flex items-center"><Activity className="w-3 h-3 mr-1" /> Qty: {d.quantity} units</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAccept(d._id)}
                                            className="w-full mt-4 py-2 bg-orange-500 text-white rounded-lg font-black text-xs cursor-pointer hover:bg-orange-600 transition shadow-md"
                                        >
                                            ACCEPT PICKUP
                                        </button>
                                    </div>
                                ))}
                                {pendingDonations.length === 0 && <p className="text-center py-8 text-xs font-bold text-gray-400">Scanning for new donations...</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {message && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000]"><MessageDisplay message={message} /></div>}
                
                {selectedForTracking && (
                    <TrackingModal 
                        donation={selectedForTracking} 
                        ngoLocation={ngoLocation} 
                        onClose={() => setSelectedForTracking(null)} 
                    />
                )}
            </div>
        </div>
    );
};

export default NgoDashboard;