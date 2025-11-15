import React, { useState, useEffect, useCallback } from 'react';
import { Map, Package, Clock, Truck, CheckCircle, LocateFixed, Users, RefreshCw, MapPin, Navigation, TrendingUp, Award, Target, Activity } from 'lucide-react';
import { PRIMARY_RED, DARK_CHARCOAL, MessageDisplay, API_BASE_URL } from './Shared';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Custom Icons
const ngoIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const donorIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className={`${bgColor} border-l-4 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform  cursor-pointer`} style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold" style={{ color: color }}>{value}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1 font-semibold">{subtitle}</p>}
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-8 h-8" style={{ color: color }} />
            </div>
        </div>
    </div>
);

// Auto-center map
function MapBoundsHandler({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }
    }, [markers, map]);

    return null;
}

// Distance Calculation
const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2 || loc1.lat === null || loc2.lat === null) return 'N/A';
    const R = 6371;
    const toRad = (value) => value * Math.PI / 180;

    const dLat = toRad(loc2.lat - loc1.lat);
    const dLon = toRad(loc2.lng - loc1.lng);
    const lat1 = toRad(loc1.lat);
    const lat2 = toRad(loc2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

// Interactive Map Component
const InteractiveDonationMap = ({ ngoLocation, pendingDonations, onAcceptDonation }) => {
    if (!ngoLocation || ngoLocation.lat === null) {
        return (
            <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <LocateFixed className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-gray-500 font-semibold">Setting up your location...</p>
                </div>
            </div>
        );
    }

    const allMarkers = [
        ngoLocation,
        ...pendingDonations.filter(d => d.location?.lat).map(d => d.location)
    ];

    return (
        <MapContainer
            center={[ngoLocation.lat, ngoLocation.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-[500px] rounded-lg shadow-md"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />

            <Marker position={[ngoLocation.lat, ngoLocation.lng]} icon={ngoIcon}>
                <Popup>
                    <div className="text-center p-2 font-semibold">
                        <LocateFixed className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                        <p className="font-bold">Your NGO Location</p>
                        <p className="text-xs text-gray-500 mt-1">Base Station</p>
                    </div>
                </Popup>
            </Marker>

            {pendingDonations.filter(d => d.location?.lat).map(donation => {
                const distance = calculateDistance(ngoLocation, donation.location);

                return (
                    <Marker
                        key={donation._id}
                        position={[donation.location.lat, donation.location.lng]}
                        icon={donorIcon}
                    >
                        <Popup>
                            <div className="p-3 min-w-[200px] font-semibold">
                                <div className="flex items-start space-x-2 mb-2">
                                    <Package className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-gray-800">{donation.foodType}</p>
                                        <p className="text-sm text-gray-600">Qty: {donation.quantity}</p>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 space-y-1 mb-3">
                                    <p className="flex items-center">
                                        <Navigation className="w-3 h-3 mr-1" />
                                        Distance: <span className="font-bold ml-1">{distance} km</span>
                                    </p>
                                    <p className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Expires: {donation.expiresInHours}h
                                    </p>
                                    {donation.donorId?.name && (
                                        <p>Donor: {donation.donorId.name}</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => onAcceptDonation(donation._id)}
                                    className="w-full py-2 text-white font-semibold rounded text-sm cursor-pointer hover:opacity-90"
                                    style={{ backgroundColor: PRIMARY_RED }}
                                >
                                    Accept Pickup
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            <MapBoundsHandler markers={allMarkers} />
        </MapContainer>
    );
};

const NgoDashboard = ({ onLogout }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingDonations, setPendingDonations] = useState([]);
    const [acceptedDonations, setAcceptedDonations] = useState([]);
    const [ngoLocation, setNgoLocation] = useState({ lat: null, lng: null });
    const [message, setMessage] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackingDonationId, setTrackingDonationId] = useState(null);
    const [isLoadingPending, setIsLoadingPending] = useState(false);

    const activeTrackingDonation = acceptedDonations.find(d => d._id === trackingDonationId);

    // Calculate statistics
    const stats = {
        totalAccepted: acceptedDonations.length,
        pending: pendingDonations.length,
        active: acceptedDonations.filter(d => d.status === 'accepted' || d.status === 'onTheWay').length,
        completed: acceptedDonations.filter(d => d.status === 'picked' || d.status === 'completed').length,
        totalQuantity: acceptedDonations.reduce((sum, d) => sum + (d.quantity || 0), 0)
    };

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                setCurrentUser(user);
                if (user.location && user.location.lat !== null) {
                    setNgoLocation(user.location);
                } else {
                    setNgoLocation({ lat: 28.6139, lng: 77.2090 });
                }
            } else {
                if (response.status === 401 || response.status === 403) {
                    onLogout();
                }
            }
        } catch (error) {
            console.error('Fetch User Error:', error);
        }
    }, [onLogout]);

    const loadDonations = useCallback(async () => {
        if (!currentUser) return;

        setIsLoadingPending(true);

        try {
            const token = localStorage.getItem('authToken');

            const pendingResponse = await fetch(`${API_BASE_URL}/api/donations/pending`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await pendingResponse.json();

            if (pendingResponse.ok) {
                setPendingDonations(data.donations || data);
            }

            const acceptedResponse = await fetch(`${API_BASE_URL}/api/donations/my-accepted`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const acceptedData = await acceptedResponse.json();

            if (acceptedResponse.ok) {
                setAcceptedDonations(acceptedData.donations || acceptedData);
            }

        } catch (error) {
            console.error('Fetch Donations Error:', error);
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setIsLoadingPending(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    useEffect(() => {
        if (currentUser) {
            loadDonations();
        }
        const interval = setInterval(() => {
            if (currentUser) loadDonations();
        }, 10000);
        return () => clearInterval(interval);
    }, [loadDonations, currentUser]);

    const updateNgoLocationAPI = useCallback(async (donationId, currentNgoLocation, isInitialStart) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/donations/${donationId}/update-location`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                lat: currentNgoLocation.lat + (Math.random() - 0.5) * 0.0005,
                lng: currentNgoLocation.lng + (Math.random() - 0.5) * 0.0005
            }),
        });
        const data = await response.json();

        if (response.ok) {
            setNgoLocation(data.donation.ngoLocation);

            if (isInitialStart) {
                setMessage({ type: 'success', text: 'Live tracking started!' });
            }

            setAcceptedDonations(prev => prev.map(d =>
                d._id === donationId ? { ...d, status: 'onTheWay', ngoLocation: data.donation.ngoLocation } : d
            ));
        }
    }, []);

    useEffect(() => {
        if (!isTracking || !trackingDonationId || !activeTrackingDonation || ngoLocation.lat === null) return;

        const trackingPoll = setInterval(() => {
            if (activeTrackingDonation.status === 'accepted' || activeTrackingDonation.status === 'onTheWay') {
                updateNgoLocationAPI(trackingDonationId, ngoLocation, false);
            }
        }, 5000);

        return () => clearInterval(trackingPoll);
    }, [isTracking, trackingDonationId, activeTrackingDonation, ngoLocation, updateNgoLocationAPI]);

    const handleAcceptDonation = async (donationId) => {
        setMessage(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/donations/${donationId}/accept`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                const acceptedDonation = pendingDonations.find(d => d._id === donationId);
                if (acceptedDonation) {
                    setPendingDonations(prev => prev.filter(d => d._id !== donationId));
                    setAcceptedDonations(prev => [{ ...acceptedDonation, status: 'accepted', acceptedBy: currentUser }, ...prev]);
                    handleStartPickup(donationId);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to accept.' });
            }
        } catch (error) {
            console.error('Accept Error:', error);
        }
    };

    const handleStartPickup = (id) => {
        setIsTracking(true);
        setTrackingDonationId(id);
        if (ngoLocation.lat !== null) {
            updateNgoLocationAPI(id, ngoLocation, true);
        }
    };

    const handlePickupCompleted = async (id) => {
        setIsTracking(false);
        setTrackingDonationId(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/donations/${id}/mark-picked`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setAcceptedDonations(prev => prev.map(d =>
                    d._id === id ? { ...d, status: 'picked', ngoLocation: null } : d
                ));
                setMessage({ type: 'success', text: 'Pickup completed!' });
            }
        } catch (error) {
            console.error('Pickup Complete Error:', error);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#387ED1] mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 font-semibold">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-8">

                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 font-semibold" style={{ color: DARK_CHARCOAL }}>
                        Welcome, {currentUser.name}! 🎯
                    </h1>
                    <p className="text-lg text-gray-600 font-semibold">Your NGO Performance Dashboard</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={CheckCircle}
                        title="Total Accepted"
                        value={stats.totalAccepted}
                        subtitle="All donations"
                        color="#387ED1"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Target}
                        title="Available"
                        value={stats.pending}
                        subtitle="Near you"
                        color="#f59e0b"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Truck}
                        title="Active Pickups"
                        value={stats.active}
                        subtitle="In progress"
                        color="#10b981"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Award}
                        title="Completed"
                        value={stats.completed}
                        subtitle="Successfully picked"
                        color="#8b5cf6"
                        bgColor="bg-white"
                    />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-8 shadow-lg font-semibold">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Collection Impact</h3>
                            <p className="text-white/90">You've collected <span className="font-bold text-3xl">{stats.totalQuantity}</span> units of food!</p>
                            <p className="text-sm text-white/80 mt-2">Keep up the amazing work! 🌟</p>
                        </div>
                        <Activity className="w-20 h-20 text-white/20" />
                    </div>
                </div>

                {message && <div className="mb-6"><MessageDisplay message={message} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                                    <Map className="w-6 h-6 mr-2 text-[#387ED1]" /> Nearby Donations
                                </h2>
                                <button
                                    onClick={loadDonations}
                                    disabled={isLoadingPending}
                                    className={`flex items-center text-sm px-3 py-2 rounded-lg transition font-semibold cursor-pointer ${isLoadingPending ? 'text-gray-400 bg-gray-100' : 'text-blue-600 hover:bg-blue-50 border border-blue-200'}`}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingPending ? 'animate-spin' : ''}`} />
                                    {isLoadingPending ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>

                            <InteractiveDonationMap
                                ngoLocation={ngoLocation}
                                pendingDonations={pendingDonations}
                                onAcceptDonation={handleAcceptDonation}
                            />

                            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-orange-50 p-3 rounded-lg border border-blue-200 font-semibold">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="font-semibold">Your Location</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <span className="font-semibold">Donations</span>
                                </div>
                                <div className="text-xs bg-white px-2 py-1 rounded font-semibold">
                                    Click markers for details
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                                <Clock className="w-6 h-6 mr-2 text-yellow-500" /> Pending ({stats.pending})
                            </h2>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {pendingDonations.length === 0 ? (
                                    <div className="text-center py-12 font-semibold">
                                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No pending donations</p>
                                    </div>
                                ) : (
                                    pendingDonations.map(donation => {
                                        const distance = calculateDistance(ngoLocation, donation.location);
                                        return (
                                            <div
                                                key={donation._id}
                                                className="p-4 border-2 border-orange-200 rounded-lg shadow-sm bg-orange-50 hover:shadow-md transition-shadow cursor-pointer"
                                            >
                                                <p className="font-bold text-lg text-gray-800 font-semibold">{donation.foodType}</p>
                                                <p className="text-sm text-gray-600 mt-1 font-semibold">Qty: {donation.quantity} units</p>
                                                <p className="text-xs text-gray-500 flex items-center mt-2 font-semibold">
                                                    <Navigation className="w-3 h-3 mr-1 text-blue-500" />
                                                    <span className="font-bold">{distance} km away</span>
                                                </p>
                                                <button
                                                    onClick={() => handleAcceptDonation(donation._id)}
                                                    className="w-full mt-3 py-2 text-white font-semibold rounded-lg text-sm shadow-md hover:opacity-90 cursor-pointer"
                                                    style={{ backgroundColor: PRIMARY_RED }}
                                                >
                                                    Accept Now
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                            <TrendingUp className="w-6 h-6 mr-2 text-green-600" /> Your Accepted Donations
                        </h2>

                        {acceptedDonations.length === 0 ? (
                            <div className="text-center py-12 font-semibold">
                                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No accepted donations yet</p>
                                <p className="text-gray-400 text-sm mt-2">Start accepting donations to see them here!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {acceptedDonations.map(donation => (
                                    <div key={donation._id} className="p-5 border-2 rounded-lg shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow cursor-pointer" style={{ borderColor: donation.status === 'picked' ? '#8b5cf6' : '#10b981' }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-lg font-bold text-gray-800 font-semibold">{donation.foodType}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold font-semibold ${donation.status === 'picked' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'
                                                }`}>
                                                {donation.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 font-semibold">Qty: {donation.quantity} units</p>

                                        <div className="space-y-2">
                                            {donation.status !== 'picked' && (
                                                <>
                                                    {isTracking && trackingDonationId === donation._id ? (
                                                        <button
                                                            onClick={() => setIsTracking(false)}
                                                            className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm cursor-pointer"
                                                        >
                                                            Pause Tracking
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStartPickup(donation._id)}
                                                            className="w-full py-2 text-white rounded-lg font-semibold text-sm shadow-md cursor-pointer"
                                                            style={{ backgroundColor: PRIMARY_RED }}
                                                            disabled={isTracking && trackingDonationId !== donation._id}
                                                        >
                                                            <Truck className="w-4 h-4 inline mr-1" />
                                                            {donation.status === 'accepted' ? 'Start Pickup' : 'Resume'}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handlePickupCompleted(donation._id)}
                                                        disabled={donation.status !== 'onTheWay'}
                                                        className={`w-full py-2 rounded-lg font-semibold text-sm ${donation.status === 'onTheWay'
                                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer'
                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                                        Mark as Picked
                                                    </button>
                                                </>
                                            )}
                                            {donation.status === 'picked' && (
                                                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 text-center font-semibold">
                                                    <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                                                    <p className="text-sm font-bold text-purple-800">Completed ✓</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NgoDashboard;