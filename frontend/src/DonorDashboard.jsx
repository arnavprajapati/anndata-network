import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Compass, MapPin, User, Clock, Package, CheckCircle, Truck, RefreshCw, Activity, TrendingUp, Award, Heart } from 'lucide-react';
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

const DonationItem = ({ donation }) => {
    const ngoName = donation.acceptedBy?.name;
    const locationDisplay = donation.location?.text || `${donation.location?.lat?.toFixed(4)}, ${donation.location?.lng?.toFixed(4)}`;

    const statusColors = {
        pending: 'bg-yellow-50 border-yellow-200',
        accepted: 'bg-blue-50 border-blue-200',
        onTheWay: 'bg-green-50 border-green-200',
        picked: 'bg-purple-50 border-purple-200',
        completed: 'bg-green-100 border-green-300'
    };

    return (
        <div className={`p-4 border rounded-lg mb-3 ${statusColors[donation.status] || 'bg-gray-50 border-gray-200'} transition duration-200 hover:shadow-lg cursor-pointer`}>
            <div className="flex items-start space-x-3">
                <StatusIcon status={donation.status} />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-lg font-bold text-gray-800 font-semibold">{donation.foodType}</p>
                            <p className="text-sm text-gray-600 font-semibold">Quantity: {donation.quantity} units</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-semibold ${donation.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            donation.status === 'accepted' ? 'bg-blue-200 text-blue-800' :
                                donation.status === 'onTheWay' ? 'bg-green-200 text-green-800' :
                                    donation.status === 'picked' ? 'bg-purple-200 text-purple-800' :
                                        'bg-green-300 text-green-900'
                            }`}>
                            {donation.status}
                        </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 font-semibold">
                        <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> Expires in: {donation.expiresInHours} hours
                        </p>
                        <p className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" /> {locationDisplay}
                        </p>
                        {ngoName && (
                            <p className="flex items-center">
                                <User className="w-4 h-4 mr-1" /> Accepted by: <span className="text-blue-600 ml-1">{ngoName}</span>
                            </p>
                        )}
                        <p className="text-xs text-gray-500 font-semibold">
                            Created: {new Date(donation.createdAt).toLocaleDateString()} at {new Date(donation.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    return (R * c).toFixed(2);
};

const LiveTrackingSection = ({ donorLocation, ngoLocation }) => {
    if (!donorLocation || !ngoLocation) return null;

    const distanceKm = calculateDistance(donorLocation, ngoLocation);
    const mockSpeedKmh = 20;
    const etaMinutes = Math.round((distanceKm / mockSpeedKmh) * 60);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                <Compass className="w-5 h-5 mr-2 text-blue-500" /> Live Tracking
            </h3>

            <DonationTrackingMap
                donorLocation={donorLocation}
                ngoLocation={ngoLocation}
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200 font-semibold">
                    <p className="text-xs text-gray-600 mb-1">Distance</p>
                    <p className="text-2xl font-bold text-blue-600">{distanceKm} km</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200 font-semibold">
                    <p className="text-xs text-gray-600 mb-1">ETA</p>
                    <p className="text-2xl font-bold text-green-600">{etaMinutes > 0 ? `${etaMinutes} min` : 'Arrived!'}</p>
                </div>
            </div>

            <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
                <p className="text-center text-sm text-gray-700 flex items-center justify-center font-semibold">
                    <Truck className="w-4 h-4 mr-2 text-green-600 animate-pulse" />
                    NGO vehicle is on the way. Updates every 5 seconds.
                </p>
            </div>
        </div>
    );
};

const DonorDashboard = ({ onLogout }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const [donationForm, setDonationForm] = useState({
        foodType: '',
        quantity: '',
        expiresInHours: '',
        locationText: 'Click AUTO to detect location',
        location: { lat: null, lng: null },
    });
    const [message, setMessage] = useState(null);

    const activeDonation = donations.find(d =>
        (d.status === 'accepted' || d.status === 'onTheWay') && d.ngoLocation
    );

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
                method: 'GET',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.user;
                setCurrentUser(user);
                setDonationForm(prev => ({
                    ...prev,
                    locationText: user.location?.text || 'Click AUTO to detect location',
                    location: user.location || { lat: null, lng: null },
                }));
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

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/api/donations/my`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setDonations(data.donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to fetch donations.' });
                if (response.status === 401 || response.status === 403) {
                    onLogout();
                }
            }
        } catch (error) {
            console.error('Fetch Donations Error:', error);
            setMessage({ type: 'error', text: 'A network error occurred while fetching donations.' });
        }
    }, [onLogout, currentUser]);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    useEffect(() => {
        if (currentUser) {
            if (!donations.length) {
                setIsLoading(true);
                loadDonations().finally(() => setIsLoading(false));
            }
        }
        const intervalId = setInterval(() => {
            if (activeDonation && currentUser) {
                loadDonations();
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [currentUser, activeDonation, loadDonations, donations.length]);

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setMessage(null);

        const newValue = id === 'quantity' || id === 'expiresInHours' ? (value ? parseInt(value) : '') : value;
        setDonationForm(prev => ({ ...prev, [id]: newValue }));
    };

    const handleCreateDonation = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        const { foodType, quantity, expiresInHours, location } = donationForm;

        if (!foodType || !quantity || !expiresInHours || location.lat === null || location.lng === null) {
            setMessage({ type: 'error', text: 'All donation fields and GPS location (click AUTO) are required.' });
            setIsLoading(false);
            return;
        }

        const payload = { foodType, quantity, expiresInHours, location };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/donations/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Donation created successfully! Awaiting NGO acceptance.' });

                await loadDonations();

                setDonationForm(prev => ({
                    ...prev, foodType: '', quantity: '', expiresInHours: ''
                }));

                setIsLoading(false);

            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to create donation.' });
                setIsLoading(false);
            }

        } catch (error) {
            console.error('Create Donation Error:', error);
            setMessage({ type: 'error', text: 'A network error occurred during donation creation.' });
            setIsLoading(false);
        }
    };

    const handleAutoGps = () => {
        setIsDetectingLocation(true);
        setMessage({ type: 'info', text: 'Detecting your location...' });
        setDonationForm(prev => ({ ...prev, locationText: 'Detecting location...' }));

        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            setDonationForm(prev => ({ ...prev, locationText: 'Geolocation not supported' }));
            setIsDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'FoodDonationApp/1.0'
                            }
                        }
                    );
                    
                    const data = await response.json();
                    const locationText = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    
                    setDonationForm(prev => ({
                        ...prev,
                        locationText: locationText,
                        location: { lat: latitude, lng: longitude }
                    }));
                    setMessage({ type: 'success', text: '📍 Current location detected successfully!' });
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    setDonationForm(prev => ({
                        ...prev,
                        locationText: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                        location: { lat: latitude, lng: longitude }
                    }));
                    setMessage({ type: 'success', text: '📍 Location detected (address lookup failed)' });
                }
                setIsDetectingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                
                let errorMessage = 'Could not detect location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                
                setMessage({ type: 'error', text: errorMessage });
                
                if (currentUser?.location && currentUser.location.lat !== null) {
                    const savedLocation = {
                        text: currentUser.location.text || 'Saved Location',
                        lat: currentUser.location.lat,
                        lng: currentUser.location.lng
                    };
                    setDonationForm(prev => ({
                        ...prev,
                        locationText: savedLocation.text,
                        location: { lat: savedLocation.lat, lng: savedLocation.lng }
                    }));
                    setMessage({ type: 'info', text: 'Using your saved location instead' });
                } else {
                    setDonationForm(prev => ({ ...prev, locationText: 'Location detection failed - Click AUTO to retry' }));
                }
                setIsDetectingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const buttonStyle = { backgroundColor: DARK_CHARCOAL };

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
                        Welcome back, {currentUser.name}! 👋
                    </h1>
                    <p className="text-lg text-gray-600 font-semibold">Here's your donation impact summary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Package}
                        title="Total Donations"
                        value={stats.total}
                        subtitle="All time"
                        color="#387ED1"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Clock}
                        title="Pending"
                        value={stats.pending}
                        subtitle="Awaiting acceptance"
                        color="#f59e0b"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Truck}
                        title="Active"
                        value={stats.active}
                        subtitle="In progress"
                        color="#10b981"
                        bgColor="bg-white"
                    />
                    <StatCard
                        icon={Award}
                        title="Completed"
                        value={stats.completed}
                        subtitle="Successfully delivered"
                        color="#8b5cf6"
                        bgColor="bg-white"
                    />
                </div>

                <div className="bg-gradient-to-r from-[#387ED1] to-[#a9303c] text-white rounded-xl p-6 mb-8 shadow-lg font-semibold">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Your Impact</h3>
                            <p className="text-white/90">You've donated a total of <span className="font-bold text-3xl">{stats.totalQuantity}</span> units of food!</p>
                            <p className="text-sm text-white/80 mt-2">Thank you for making a difference in your community 💚</p>
                        </div>
                        <Heart className="w-20 h-20 text-white/20" />
                    </div>
                </div>

                {message && <div className="mb-6"><MessageDisplay message={message} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                                <PlusCircle className="w-6 h-6 mr-2" style={{ color: PRIMARY_RED }} /> Quick Donation
                            </h2>
                            <div className="space-y-4">
                                <FormInput
                                    id="foodType"
                                    label="Food Type (e.g., Rice, Meals)"
                                    icon={Package}
                                    value={donationForm.foodType}
                                    onChange={handleFormChange}
                                    required
                                />
                                <FormInput
                                    id="quantity"
                                    label="Quantity (in units)"
                                    type="number"
                                    icon={Activity}
                                    value={donationForm.quantity}
                                    onChange={handleFormChange}
                                    required
                                />
                                <FormInput
                                    id="expiresInHours"
                                    label="Expires In Hours"
                                    type="number"
                                    icon={Clock}
                                    value={donationForm.expiresInHours}
                                    onChange={handleFormChange}
                                    required
                                />

                                <div className="relative">
                                    <FormInput
                                        id="locationText"
                                        label="Location (Address)"
                                        icon={MapPin}
                                        value={donationForm.locationText}
                                        onChange={(e) => setDonationForm(prev => ({ ...prev, locationText: e.target.value }))}
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAutoGps}
                                        disabled={isDetectingLocation}
                                        className={`absolute top-0 right-0 mt-3 mr-3 p-2 text-sm font-semibold rounded-lg text-white transition duration-150 flex items-center shadow-md ${
                                            isDetectingLocation 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                        }`}
                                    >
                                        <Compass className={`w-4 h-4 mr-1 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                                        {isDetectingLocation ? 'Detecting...' : 'Auto'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                                        {donationForm.location.lat !== null ? (
                                            <>📍 {donationForm.location.lat?.toFixed(4)}, {donationForm.location.lng?.toFixed(4)}</>
                                        ) : (
                                            <>📍 No location set - Click AUTO button</>
                                        )}
                                    </p>
                                </div>

                                <button
                                    onClick={handleCreateDonation}
                                    disabled={isLoading || donationForm.location.lat === null}
                                    className={`w-full py-3 mt-4 text-white font-bold rounded-lg transition duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center font-semibold ${
                                        isLoading || donationForm.location.lat === null
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }`}
                                    style={buttonStyle}
                                >
                                    {isLoading ? 'Creating...' : (
                                        <>
                                            <PlusCircle className="w-5 h-5 mr-2" />
                                            Create Donation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">

                        {activeDonation && activeDonation.ngoLocation && (
                            <LiveTrackingSection
                                donorLocation={activeDonation.location}
                                ngoLocation={activeDonation.ngoLocation}
                            />
                        )}

                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center font-semibold" style={{ color: DARK_CHARCOAL }}>
                                    <TrendingUp className="w-6 h-6 mr-2" style={{ color: PRIMARY_RED }} />
                                    Your Donations ({donations.length})
                                </h2>
                                <button
                                    onClick={() => { setIsLoading(true); loadDonations().finally(() => setIsLoading(false)); }}
                                    disabled={isLoading}
                                    className={`flex items-center text-sm font-semibold py-2 px-4 rounded-lg transition ${isLoading ? 'text-gray-400 bg-gray-100' : 'text-gray-700 hover:bg-gray-100 border border-gray-300'} cursor-pointer`}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto pr-2">
                                {donations.length === 0 ? (
                                    <div className="text-center py-12 font-semibold">
                                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No donations yet</p>
                                        <p className="text-gray-400 text-sm mt-2">Create your first donation to get started!</p>
                                    </div>
                                ) : (
                                    donations.map(donation => (
                                        <DonationItem key={donation._id} donation={donation} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;