import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Activity, Key, Eye, EyeOff, Loader, CheckCircle, Navigation } from 'lucide-react';
import { FormInput, MessageDisplay, DARK_CHARCOAL, API_BASE_URL } from './Shared';

const SignupPage = ({ onSwitchToLogin, onSignupSuccess }) => {
    const THEME_GREEN = "#2D8659";

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'donor',
        locationText: '',
        location: { lat: null, lng: null, text: '' }, // Added location object
        securityQuestion: "What city were you born in?",
        securityAnswer: ''
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            return;
        }

        setIsDetecting(true);

        // First try with high accuracy, longer timeout
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Save coordinates immediately first
                    const fallbackText = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                    setFormData(prev => ({
                        ...prev,
                        locationText: fallbackText,
                        location: {
                            lat: latitude,
                            lng: longitude,
                            text: fallbackText
                        }
                    }));


                    // Then try to fetch address (with timeout)
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);

                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    'User-Agent': 'FoodDonationApp/1.0'
                                },
                                signal: controller.signal
                            }
                        );

                        clearTimeout(timeoutId);

                        if (res.ok) {
                            const data = await res.json();
                            const address = data.display_name || fallbackText;

                            setFormData(prev => ({
                                ...prev,
                                locationText: address,
                                location: {
                                    lat: latitude,
                                    lng: longitude,
                                    text: address
                                }
                            }));

                        }
                    } catch (addressError) {
                        // Address fetch failed but we already have coordinates
                        console.log('Address lookup skipped or failed:', addressError.message);
                        setMessage({ type: 'success', text: '📍 Location detected!' });
                    }

                } catch (error) {
                    console.error('Location processing error:', error);
                    setMessage({ type: 'error', text: 'Failed to process location data' });
                } finally {
                    setIsDetecting(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);

                // If high accuracy fails, try without it
                if (error.code === error.TIMEOUT && error.TIMEOUT) {
                    setMessage({ type: 'info', text: 'Retrying with lower accuracy...' });

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const fallbackText = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

                            setFormData(prev => ({
                                ...prev,
                                locationText: fallbackText,
                                location: {
                                    lat: latitude,
                                    lng: longitude,
                                    text: fallbackText
                                }
                            }));

                            setMessage({ type: 'success', text: '📍 Location detected!' });
                            setIsDetecting(false);
                        },
                        (retryError) => {
                            setIsDetecting(false);
                            let errorMessage = 'Could not detect location. Please try again.';

                            switch (retryError.code) {
                                case retryError.PERMISSION_DENIED:
                                    errorMessage = 'Location permission denied. Please enable in browser settings.';
                                    break;
                                case retryError.POSITION_UNAVAILABLE:
                                    errorMessage = 'Location unavailable. Please check your device settings.';
                                    break;
                                case retryError.TIMEOUT:
                                    errorMessage = 'Location timeout. Please try again or enter manually.';
                                    break;
                            }

                            setMessage({ type: 'error', text: errorMessage });
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 20000,
                            maximumAge: 60000
                        }
                    );
                } else {
                    setIsDetecting(false);
                    let errorMessage = 'Could not detect location';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable in browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location unavailable. Please check your device settings.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location timeout. Please try again.';
                            break;
                    }

                    setMessage({ type: 'error', text: errorMessage });
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const handleChange = (e) => {
        const { id, value, name, type, checked } = e.target;
        const inputName = name || id;
        const newValue = type === 'radio' ? (checked ? value : formData[inputName]) : value;
        setFormData(prev => ({ ...prev, [inputName]: newValue }));
        if (message) setMessage(null);
    };

    const nextStep = () => {
        setMessage(null);
        if (step === 1 && !formData.name) return setMessage({ type: 'error', text: 'Name is required.' });
        if (step === 2 && !formData.securityAnswer) return setMessage({ type: 'error', text: 'Answer is required.' });
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setMessage(null);
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;
        setMessage(null);
        setIsLoading(true);

        try {
            // Send the complete location object to backend
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                securityQuestion: formData.securityQuestion,
                securityAnswer: formData.securityAnswer,
                location: formData.location // Send full location object with lat, lng, text
            };

            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Account created successfully!' });
                if (onSignupSuccess) onSignupSuccess({ token: data.token, user: data.user });
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn w-[90%] mx-auto px-4 pb-4">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: DARK_CHARCOAL }}>Create Account</h2>
                <p className="text-gray-400 text-sm mt-1">Join our community today</p>
            </div>

            <div className="flex justify-between items-center mb-12 relative max-w-[240px] mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className="bg-white px-1">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${s <= step ? 'text-white shadow-md' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}
                            style={s <= step ? { backgroundColor: THEME_GREEN } : {}}
                        >
                            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                        </div>
                    </div>
                ))}
            </div>

            {message && <MessageDisplay message={message} />}

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                {step === 1 && (
                    <div className="space-y-6 animate-slideInRight">
                        <FormInput id="name" label="FULL NAME" icon={User} value={formData.name} onChange={handleChange} className="bg-gray-50 border-none rounded-2xl p-4" />
                        <div className="space-y-3">
                            <label className="text-[14px] font-bold text-gray-400 tracking-widest ml-1 uppercase">I Am A...</label>
                            <div className="flex gap-3">
                                {['donor', 'ngo'].map((r) => (
                                    <button
                                        key={r} type="button"
                                        onClick={() => setFormData(p => ({ ...p, role: r }))}
                                        className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === r ? 'bg-white shadow-sm' : 'bg-gray-50 border-transparent opacity-50'}`}
                                        style={formData.role === r ? { borderColor: THEME_GREEN } : {}}
                                    >
                                        {r === 'donor' ? <User className="w-5 h-5" style={{ color: formData.role === r ? THEME_GREEN : '#9ca3af' }} /> : <Activity className="w-5 h-5" style={{ color: formData.role === r ? THEME_GREEN : '#9ca3af' }} />}
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === r ? 'text-gray-800' : 'text-gray-400'}`}>{r}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <FormInput
                                id="locationText"
                                label="LOCATION"
                                icon={MapPin}
                                value={formData.locationText}
                                onChange={handleChange}
                                className="bg-gray-50 border-none rounded-2xl p-4 pr-24"
                                readOnly
                            />
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={isDetecting}
                                className="absolute right-2 top-[25%] cursor-pointer -translate-y-1/2 mt-3 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
                                style={{ backgroundColor: `${THEME_GREEN}15`, color: THEME_GREEN }}
                            >
                                {isDetecting ? <Loader className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                Detect
                            </button>
                        </div>

                        {/* Show coordinates if location is detected */}
                        {formData.location.lat && (
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                                📍 {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                            </p>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-slideInRight">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 tracking-widest ml-1 uppercase">Security Question</label>
                            <select id="securityQuestion" name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-semibold focus:outline-none appearance-none border-none text-gray-700">
                                <option>What city were you born in?</option>
                                <option>What was your first pet's name?</option>
                            </select>
                        </div>
                        <FormInput id="securityAnswer" label="YOUR ANSWER" icon={Key} value={formData.securityAnswer} onChange={handleChange} className="bg-gray-50 border-none rounded-2xl p-4" />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-slideInRight">
                        <FormInput id="email" label="EMAIL ADDRESS" type="email" icon={Mail} value={formData.email} onChange={handleChange} className="bg-gray-50 border-none rounded-2xl p-4" />
                        <div className="relative">
                            <FormInput
                                id="password"
                                label="PASSWORD"
                                type={showPassword ? "text" : "password"}
                                icon={Lock}
                                value={formData.password}
                                onChange={handleChange}
                                className="bg-gray-50 border-none rounded-2xl p-4 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3/2 -translate-y-1/2 mt-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    {step > 1 && (
                        <button type="button" onClick={prevStep} className="flex-1 p-4 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest">Back</button>
                    )}
                    <button
                        type={step === 3 ? "submit" : "button"}
                        onClick={step < 3 ? nextStep : undefined}
                        disabled={isLoading}
                        className="flex-[2] p-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-lg transition active:scale-[0.98] flex items-center justify-center"
                        style={{ backgroundColor: THEME_GREEN }}
                    >
                        {step === 3 ? (isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Finish') : 'Continue'}
                    </button>
                </div>
            </form>

            <div className="mt-12 text-center">
                <button onClick={onSwitchToLogin} className="text-[10px] font-black text-gray-400 hover:text-gray-600 transition tracking-[0.2em] uppercase">
                    Already have an account? <span style={{ color: THEME_GREEN }}>Log In</span>
                </button>
            </div>
        </div>
    );
};

export default SignupPage;