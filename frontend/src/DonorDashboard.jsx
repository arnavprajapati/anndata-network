import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Compass, MapPin, User, Clock, Package, CheckCircle, Truck, RefreshCw, Activity, TrendingUp, Award, Heart, Map, X } from 'lucide-react';
import { FormInput, PRIMARY_RED, DARK_CHARCOAL, MessageDisplay, API_BASE_URL } from './Shared';
import DonationTrackingMap from './DonationTrackingMap';


const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div
        className={`${bgColor} border-l-4 rounded-lg p-6 shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg`}
        style={{ borderColor: color }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold" style={{ color: color }}>{value}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-semibold mt-1">{subtitle}</p>}
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-8 h-8" style={{ color: color }} />
            </div>
        </div>
    </div>
);

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'pending': return <Clock className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />;
        case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />;
        case 'onTheWay': return <Truck className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />;
        case 'picked': return <Package className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" />;
        case 'completed': return <CheckCircle className="w-5 h-5 text-green-700 mr-2 flex-shrink-0" />;
        default: return <Package className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />;
    }
};

const DonationItem = ({ donation, onViewMap }) => {
    const ngoName = donation.acceptedBy?.name;
    const locationDisplay = donation.location?.text || `${donation.location?.lat?.toFixed(4)}, ${donation.location?.lng?.toFixed(4)}`;

    const statusColors = {
        pending: 'bg-yellow-50 border-yellow-200',
        accepted: 'bg-blue-50 border-blue-200',
        onTheWay: 'bg-green-50 border-green-200',
        picked: 'bg-purple-50 border-purple-200',
        completed: 'bg-green-100 border-green-300'
    };

    const canShowMap = donation.ngoLocation && donation.ngoLocation.lat !== null;

    return (
        <div className={`p-4 border rounded-lg mb-3 ${statusColors[donation.status] || 'bg-gray-50 border-gray-200'} transition duration-200 hover:shadow-lg`}>
            <div className="flex items-start space-x-3">
                <StatusIcon status={donation.status} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-lg font-bold text-gray-800">{donation.foodType}</p>
                            <p className="text-sm text-gray-600 font-semibold">Quantity: {donation.quantity} units</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${donation.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                donation.status === 'accepted' ? 'bg-blue-200 text-blue-800' :
                                    donation.status === 'onTheWay' ? 'bg-green-200 text-green-800' :
                                        donation.status === 'picked' ? 'bg-purple-200 text-purple-800' :
                                            'bg-green-300 text-green-900'
                            }`}>
                            {donation.status}
                        </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 font-semibold">
                        <p className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Expires in: {donation.expiresInHours} hours</p>
                        <p className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {locationDisplay}</p>
                        {ngoName && (
                            <p className="flex items-center"><User className="w-4 h-4 mr-1" /> Accepted by: <span className="text-blue-600 ml-1">{ngoName}</span></p>
                        )}
                    </div>

                    {canShowMap && (
                        <button
                            onClick={() => onViewMap(donation)}
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                        >
                            <Map className="w-4 h-4 mr-2" />
                            View Live Tracking Map
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2 || loc1.lat === null || loc2.lat === null) return 'N/A';
    const R = 6371;
    const toRad = (v) => v * Math.PI / 180;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLon = toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

const MapModal = ({ donation, onClose }) => {
    if (!donation || !donation.ngoLocation) return null;

    const distanceKm = calculateDistance(donation.location, donation.ngoLocation);
    const etaMinutes = Math.round((distanceKm / 20) * 60);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
                <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{donation.foodType} Tracking</h2>
                        <p className="text-xs text-gray-500">NGO: {donation.acceptedBy?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200">
                        <DonationTrackingMap
                            donorLocation={donation.location}
                            ngoLocation={donation.ngoLocation}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                            <p className="text-xs text-blue-600 font-bold uppercase">Distance</p>
                            <p className="text-2xl font-black text-blue-700">{distanceKm} km</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                            <p className="text-xs text-green-600 font-bold uppercase">ETA</p>
                            <p className="text-2xl font-black text-green-700">{etaMinutes > 0 ? `${etaMinutes} min` : 'Arrived!'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveTrackingSection = ({ donorLocation, ngoLocation }) => {
    if (!donorLocation || !ngoLocation) return null;
    const distanceKm = calculateDistance(donorLocation, ngoLocation);
    const etaMinutes = Math.round((distanceKm / 20) * 60);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: DARK_CHARCOAL }}>
                <Compass className="w-5 h-5 mr-2 text-blue-500" /> Live Tracking
            </h3>
            <div className="h-[400px] rounded-lg overflow-hidden mb-4 border">
                <DonationTrackingMap donorLocation={donorLocation} ngoLocation={ngoLocation} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="text-xl font-bold text-blue-600">{distanceKm} km</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                    <p className="text-xs text-gray-600">ETA</p>
                    <p className="text-xl font-bold text-green-600">{etaMinutes > 0 ? `${etaMinutes} min` : 'Arrived!'}</p>
                </div>
            </div>
        </div>
    );
};

const DonorDashboard = ({ onLogout }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [donationForm, setDonationForm] = useState({
        foodType: '', quantity: '', expiresInHours: '',
        locationText: 'Click AUTO to detect location',
        location: { lat: null, lng: null },
    });
    const [message, setMessage] = useState(null);

    const activeDonation = donations.find(d => (d.status === 'accepted' || d.status === 'onTheWay') && d.ngoLocation);

    const stats = {
        total: donations.length,
        pending: donations.filter(d => d.status === 'pending').length,
        completed: donations.filter(d => d.status === 'completed' || d.status === 'picked').length,
        active: donations.filter(d => d.status === 'accepted' || d.status === 'onTheWay').length,
        totalQuantity: donations.reduce((sum, d) => sum + (d.quantity || 0), 0)
    };

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentUser(data.user);
                setDonationForm(p => ({
                    ...p,
                    locationText: data.user.location?.text || 'Click AUTO',
                    location: data.user.location || { lat: null, lng: null }
                }));
            } else if (response.status === 401) onLogout();
        } catch (e) { console.error(e); }
    }, [onLogout]);

    const loadDonations = useCallback(async () => {
        if (!currentUser) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/donations/my`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) setDonations(data.donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (e) { console.error(e); }
    }, [currentUser]);

    useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);
    useEffect(() => {
        if (currentUser) loadDonations();
        const id = setInterval(() => { if (activeDonation) loadDonations(); }, 5000);
        return () => clearInterval(id);
    }, [currentUser, activeDonation, loadDonations]);

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        const val = (id === 'quantity' || id === 'expiresInHours') ? (value ? parseInt(value) : '') : value;
        setDonationForm(p => ({ ...p, [id]: val }));
    };

    const handleCreateDonation = async (e) => {
        e.preventDefault();
        if (!donationForm.foodType || !donationForm.location.lat) {
            setMessage({ type: 'error', text: 'Please fill all fields and detect location.' });
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(donationForm),
            });
            if (response.ok) {
                setDonationForm(p => ({ ...p, foodType: '', quantity: '', expiresInHours: '' }));
                loadDonations();
            }
        } catch (e) { setMessage({ type: 'error', text: 'Network Error' }); }
        finally { setIsLoading(false); }
    };

    const handleAutoGps = () => {
        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setDonationForm(p => ({ ...p, location: { lat: latitude, lng: longitude }, locationText: `Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                setIsDetectingLocation(false);
                setMessage({ type: 'success', text: 'Location Locked! 📍' });
            },
            () => { setIsDetectingLocation(false); setMessage({ type: 'error', text: 'GPS Failed' }); },
            { enableHighAccuracy: true }
        );
    };

    if (!currentUser) return <div className="h-screen flex items-center justify-center font-bold">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-30 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-800">Welcome, {currentUser.name}! 👋</h1>
                    <p className="text-gray-500 font-semibold">Track your donations and impact here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Package} title="Total" value={stats.total} color="#3B82F6" bgColor="bg-white" />
                    <StatCard icon={Clock} title="Pending" value={stats.pending} color="#F59E0B" bgColor="bg-white" />
                    <StatCard icon={Truck} title="Active" value={stats.active} color="#10B981" bgColor="bg-white" />
                    <StatCard icon={Award} title="Success" value={stats.completed} color="#8B5CF6" bgColor="bg-white" />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl mb-8 shadow-lg flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Your Total Impact</h3>
                        <p className="text-3xl font-black">{stats.totalQuantity} Units Donated</p>
                    </div>
                    <Heart className="w-12 h-12 opacity-30" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border sticky top-24">
                            <h2 className="text-lg font-bold mb-4 flex items-center"><PlusCircle className="mr-2 text-red-500" /> New Donation</h2>
                            <div className="space-y-4">
                                <FormInput id="foodType" label="Food Type" icon={Package} value={donationForm.foodType} onChange={handleFormChange} />
                                <FormInput id="quantity" label="Quantity" type="number" icon={Activity} value={donationForm.quantity} onChange={handleFormChange} />
                                <FormInput id="expiresInHours" label="Expiry (Hrs)" type="number" icon={Clock} value={donationForm.expiresInHours} onChange={handleFormChange} />

                                <div className="relative">
                                    <FormInput id="locationText" label="Location" icon={MapPin} value={donationForm.locationText} readOnly />
                                    <button onClick={handleAutoGps} disabled={isDetectingLocation} className="absolute right-2 top-[30%] bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold cursor-pointer hover:bg-blue-700">
                                        {isDetectingLocation ? '...' : 'AUTO'}
                                    </button>
                                </div>

                                <button onClick={handleCreateDonation} disabled={isLoading || !donationForm.location.lat} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition cursor-pointer disabled:opacity-50">
                                    {isLoading ? 'Processing...' : 'Create Donation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {activeDonation && activeDonation.ngoLocation && (
                            <LiveTrackingSection donorLocation={activeDonation.location} ngoLocation={activeDonation.ngoLocation} />
                        )}

                        <div className="bg-white p-6 rounded-2xl shadow-sm border">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Recent History</h2>
                                <button onClick={loadDonations} className="text-xs font-bold flex items-center text-gray-500 hover:text-blue-600 cursor-pointer">
                                    <RefreshCw className="w-3 h-3 mr-1" /> REFRESH
                                </button>
                            </div>
                            {donations.map(d => <DonationItem key={d._id} donation={d} onViewMap={setSelectedDonation} />)}
                        </div>
                    </div>
                </div>

                {message && <MessageDisplay message={message} />}
                {selectedDonation && <MapModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} />}
            </div>
        </div>
    );
};

export default DonorDashboard;