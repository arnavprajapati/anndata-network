import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Activity, HelpCircle, Key, ArrowLeft, ArrowRight, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { FormInput, MessageDisplay, PRIMARY_RED, DARK_CHARCOAL, API_BASE_URL } from './Shared';

const SignupPage = ({ onSwitchToLogin, onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'donor',
        locationText: '', 
        securityQuestion: 'What is your mother\'s maiden name?',
        securityAnswer: ''
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { id, value, name, type, checked } = e.target;
        const inputName = name || id; 
        const newValue = type === 'radio' ? (checked ? value : formData[inputName]) : value;

        setFormData(prev => ({ ...prev, [inputName]: newValue }));
        setMessage(null);
    };
    
    const securityQuestions = [
        "What is your mother's maiden name?",
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your favorite book?",
        "What is the name of your elementary school?",
    ];

    const nextStep = () => {
        setMessage(null);
        if (step === 1) {
            if (!formData.name || !formData.role) {
                setMessage({ type: 'error', text: 'Name and role are required.' });
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.securityAnswer) {
                setMessage({ type: 'error', text: 'Please provide an answer to your security question.' });
                return;
            }
            setStep(3);
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (step === 3 && (!formData.email || !formData.password)) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            setIsLoading(false);
            return;
        }

        const payload = { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password, 
            role: formData.role, 
            locationText: formData.locationText,
            securityQuestion: formData.securityQuestion,
            securityAnswer: formData.securityAnswer,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: `Account created! Welcome, ${formData.name}!` 
                });
                
                // Auto-login after signup
                if (onSignupSuccess) {
                    onSignupSuccess({
                        token: data.token,
                        user: data.user
                    });
                }

            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || 'Registration failed.' 
                });
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonStyle = { backgroundColor: PRIMARY_RED };
    
    // Step Indicator Component
    const StepIndicator = ({ currentStep }) => (
        <div className="flex justify-between items-center mb-10">
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                                s < currentStep 
                                    ? 'bg-green-500 text-white' 
                                    : s === currentStep 
                                    ? 'bg-[#CC3D4B] text-white shadow-lg scale-110' 
                                    : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                            {s < currentStep ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        <p className={`mt-2 text-xs font-medium text-center transition-colors duration-300 ${
                            s === currentStep ? 'text-[#CC3D4B] font-bold' : 'text-gray-500'
                        }`}>
                            {s === 1 ? 'Personal' : s === 2 ? 'Security' : 'Credentials'}
                        </p>
                    </div>
                    {s < 3 && (
                        <div className={`flex-1 h-1 mx-2 transition-all duration-300 rounded ${
                            s < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: DARK_CHARCOAL }}>
                    Create Your Account
                </h2>
                <p className="text-gray-500 text-sm">
                    Join us in making a difference
                </p>
            </div>

            <StepIndicator currentStep={step} />

            {message && <MessageDisplay message={message} />}

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <FormInput 
                            id="name" 
                            label="Full Name" 
                            icon={User} 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                        
                        <div className="relative p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2" style={{ color: PRIMARY_RED }}/>
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex flex-col items-center cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                                    formData.role === 'donor' 
                                        ? 'border-[#CC3D4B] bg-white shadow-lg scale-105' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="donor"
                                        checked={formData.role === 'donor'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <User className={`w-8 h-8 mb-2 ${formData.role === 'donor' ? 'text-[#CC3D4B]' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-bold ${formData.role === 'donor' ? 'text-[#CC3D4B]' : 'text-gray-600'}`}>
                                        Donor
                                    </span>
                                </label>
                                <label className={`flex flex-col items-center cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                                    formData.role === 'ngo' 
                                        ? 'border-[#CC3D4B] bg-white shadow-lg scale-105' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ngo"
                                        checked={formData.role === 'ngo'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <Activity className={`w-8 h-8 mb-2 ${formData.role === 'ngo' ? 'text-[#CC3D4B]' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-bold ${formData.role === 'ngo' ? 'text-[#CC3D4B]' : 'text-gray-600'}`}>
                                        NGO
                                    </span>
                                </label>
                            </div>
                        </div>

                        <FormInput 
                            id="locationText" 
                            label="Location (City, State)" 
                            icon={MapPin} 
                            value={formData.locationText} 
                            onChange={handleChange} 
                        />

                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full flex items-center justify-center py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            style={buttonStyle}
                        >
                            Next <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="mb-4">
                            <label htmlFor="securityQuestion" className="block text-sm font-semibold text-gray-700 mb-2">
                                <HelpCircle className="w-4 h-4 mr-2 inline" style={{ color: PRIMARY_RED }}/>
                                Security Question
                            </label>
                            <div className="relative">
                                <select
                                    id="securityQuestion"
                                    name="securityQuestion"
                                    value={formData.securityQuestion}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC3D4B] focus:border-[#CC3D4B] transition duration-150 text-gray-700 font-medium"
                                >
                                    {securityQuestions.map((q) => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <FormInput 
                            id="securityAnswer" 
                            label="Your Answer" 
                            type="text" 
                            icon={Key} 
                            value={formData.securityAnswer} 
                            onChange={handleChange} 
                            required 
                        />

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex-1 flex items-center justify-center py-3.5 text-gray-700 font-bold rounded-lg transition duration-200 shadow-md border-2 border-gray-300 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 flex items-center justify-center py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform hover:scale-[1.02]"
                                style={buttonStyle}
                            >
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <FormInput 
                            id="email" 
                            label="Email Address" 
                            type="email" 
                            icon={Mail} 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                        
                        <div className="relative mb-6">
                            <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden transition duration-150 focus-within:ring-2 focus-within:ring-[#CC3D4B] focus-within:ring-offset-2">
                                <div className="pl-3 py-3">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 focus:outline-none placeholder-gray-500 text-sm font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="pr-3 py-3 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex-1 flex items-center justify-center py-3.5 text-gray-700 font-bold rounded-lg transition duration-200 shadow-md border-2 border-gray-300 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Back
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 flex items-center justify-center py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform ${
                                    !isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed opacity-70'
                                }`}
                                style={buttonStyle}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin mr-2 h-5 w-5" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
            
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                </div>
            </div>

            <button 
                type="button" 
                onClick={onSwitchToLogin}
                className="w-full py-3 border-2 border-[#CC3D4B] text-[#CC3D4B] font-bold rounded-lg hover:bg-[#CC3D4B] hover:text-white transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                Log In Instead
            </button>
        </div>
    );
};

export default SignupPage;