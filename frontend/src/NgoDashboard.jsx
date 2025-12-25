import React, { useState, useEffect, useCallback } from 'react';
import { Map, Package, Clock, Truck, CheckCircle, LocateFixed, Users, RefreshCw, MapPin, Navigation, TrendingUp, Award, Target, Activity, Heart, X } from 'lucide-react';
import { PRIMARY_RED, DARK_CHARCOAL, MessageDisplay, API_BASE_URL } from './Shared';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DonationTrackingMap from './DonationTrackingMap';

// --- Helper Components ---

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

const TrackingModal = ({ donation, ngoLocation, onClose }) => {
    if (!donation) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-in zoom-in duration-200">
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Route: {donation.foodType}</h2>
                        <p className="text-xs font-bold text-blue-600">Donor: {donation.donorId?.name || 'User'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="w-full h-[450px] rounded-xl overflow-hidden border border-gray-200">
                        <DonationTrackingMap donorLocation={donation.location} ngoLocation={ngoLocation} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard ---

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

    // Live GPS Update simulation
    useEffect(() => {
        if (!isTracking || !trackingDonationId) return;
        const interval = setInterval(async () => {
            const token = localStorage.getItem('authToken');
            // Simulating movement
            const newLat = ngoLocation.lat + (Math.random() - 0.5) * 0.0006;
            const newLng = ngoLocation.lng + (Math.random() - 0.5) * 0.0006;
            
            try {
                const res = await fetch(`${API_BASE_URL}/api/donations/${trackingDonationId}/update-location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ lat: newLat, lng: newLng }),
                });
                if (res.ok) setNgoLocation({ lat: newLat, lng: newLng });
            } catch (err) { console.error("GPS Sync Error", err); }
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
            setMessage({ type: 'success', text: 'Collection Verified ✓' }); 
            loadData(); 
        }
    };

    if (!currentUser) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase">Syncing Mission Control...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">NGO Mission Control 🛰️</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{currentUser.name}</p>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer active:scale-95">
                        <RefreshCw className={`w-5 h-5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={Target} title="Nearby" value={stats.pending} color="#F59E0B" bgColor="bg-white" />
                    <StatCard icon={CheckCircle} title="Accepted" value={stats.total} color="#3B82F6" bgColor="bg-white" />
                    <StatCard icon={Truck} title="On Route" value={stats.active} color="#10B981" bgColor="bg-white" />
                    <StatCard icon={Award} title="Verified" value={stats.completed} color="#8B5CF6" bgColor="bg-white" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                        <h2 className="text-xl font-black mb-6 flex items-center text-gray-800 tracking-tight">
                            <Truck className="mr-3 text-blue-600" /> Active Missions
                        </h2>
                        
                        {acceptedDonations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <Package className="w-16 h-16 mb-2" />
                                <p className="font-black uppercase">No active pickups</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {acceptedDonations.map(d => (
                                    <div key={d._id} className="p-5 border-2 rounded-2xl bg-white shadow-sm border-gray-100 hover:border-blue-100 transition">
                                        <div className="flex justify-between mb-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${d.status === 'picked' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                {d.status}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-300">ID: {d._id.slice(-6)}</span>
                                        </div>
                                        
                                        <h3 className="text-lg font-black text-gray-800 mb-1 leading-tight">{d.foodType}</h3>
                                        <p className="text-xs font-bold text-gray-400 mb-4 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> 
                                            <span className="truncate">{d.location?.text || 'Location Shared'}</span>
                                        </p>
                                        
                                        <div className="space-y-2">
                                            {d.status !== 'picked' ? (
                                                <>
                                                    <button 
                                                        onClick={() => setSelectedForTracking(d)} 
                                                        className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                                    >
                                                        <Map className="w-4 h-4" /> VIEW ROUTE MAP
                                                    </button>
                                                    
                                                    <div className="flex gap-2 pt-1">
                                                        {isTracking && trackingDonationId === d._id ? (
                                                            <div className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-2 shadow-lg animate-pulse">
                                                                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                                                                📡 LIVE TRACKING
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => { setTrackingDonationId(d._id); setIsTracking(true); }}
                                                                disabled={isTracking && trackingDonationId !== d._id}
                                                                className="flex-1 py-2.5 bg-[#1c252e] text-white rounded-xl font-black text-[10px] hover:bg-black transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                START GPS
                                                            </button>
                                                        )}
                                                        
                                                        <button 
                                                            onClick={() => handlePickupComplete(d._id)}
                                                            className="flex-1 py-2.5 bg-[#00a651] text-white rounded-xl font-black text-[10px] hover:bg-green-700 transition shadow-md"
                                                        >
                                                            VERIFY PICKUP
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-3 bg-purple-50 text-purple-700 text-center rounded-xl font-black text-xs border border-purple-100">
                                                    MISSION ACCOMPLISHED ✓
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black mb-5 flex items-center text-gray-800 tracking-tight">
                            <Navigation className="mr-2 text-orange-500 w-5 h-5" /> NEW PINGS
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {pendingDonations.map(d => (
                                <div key={d._id} className="p-4 border-2 border-orange-50 bg-orange-50/30 rounded-2xl hover:translate-x-1 transition shadow-sm group">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-gray-800 text-sm leading-tight">{d.foodType}</p>
                                        <span className="text-[9px] font-black text-orange-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-orange-100">NEW</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 flex items-center mb-4 gap-3">
                                        <span className="flex items-center"><Users className="w-3 h-3 mr-1 text-gray-400" /> {d.donorId?.name || 'User'}</span>
                                        <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-gray-400" /> Qty: {d.quantity}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAccept(d._id)}
                                        className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-black text-xs hover:bg-orange-600 transition shadow-md active:scale-95"
                                    >
                                        ACCEPT PICKUP
                                    </button>
                                </div>
                            ))}
                            {pendingDonations.length === 0 && (
                                <p className="text-center py-10 text-xs font-bold text-gray-300 uppercase tracking-widest animate-pulse">Scanning for missions...</p>
                            )}
                        </div>
                    </div>
                </div>

                {message && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] scale-110 shadow-2xl"><MessageDisplay message={message} /></div>}
                
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