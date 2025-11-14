import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Activity, HelpCircle, Key, ArrowLeft, ArrowRight } from 'lucide-react';
import { FormInput, MessageDisplay, PRIMARY_RED, DARK_CHARCOAL } from './Shared';

const API_BASE_URL = 'http://localhost:5000';

const SignupPage = ({ onSwitchToLogin }) => {
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
    const [step, setStep] = useState(1); // New state for multi-step form

    const handleChange = (e) => {
        const { id, value, name, type, checked } = e.target;
        // Use name for radio buttons, id for FormInput
        const inputName = name || id; 
        const newValue = type === 'radio' ? (checked ? value : formData[inputName]) : value;

        setFormData(prev => ({ ...prev, [inputName]: newValue }));
    };
    
    const securityQuestions = [
        "What is your mother's maiden name?",
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your favorite book?",
        "What is the name of your elementary school?",
        "What is the name of the street you grew up on?",
        "What is your favorite food?",
        "What is the model of your first car?",
    ];

    const nextStep = () => {
        // Basic validation before moving to the next step
        setMessage(null);
        if (step === 1) {
            if (!formData.name) {
                setMessage({ type: 'error', text: 'Full Name is required.' });
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

        // Final validation for Step 3
        if (step === 3 && (!formData.email || !formData.password)) {
            setMessage({ type: 'error', text: 'Email and password are required for sign up.' });
            setIsLoading(false);
            return;
        }

        const payload = { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password, 
            role: formData.role, 
            locationText: formData.locationText, // Included locationText in payload
            securityQuestion: formData.securityQuestion,
            securityAnswer: formData.securityAnswer,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Registration successful. Token received:', data.token);
                setMessage({ 
                    type: 'success', 
                    text: `Account created successfully! Welcome, ${formData.name}. Please log in.` 
                });
                setFormData(prev => ({ 
                    ...prev, 
                    password: '', 
                    securityAnswer: '' 
                }));
                // Go back to step 1 before switching to login for a clean state
                setStep(1); 
                onSwitchToLogin(); 

            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || 'Registration failed. Please check the details.' 
                });
                setIsLoading(false); // Make sure to turn off loading on error
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessage({ type: 'error', text: 'A network error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonStyle = { backgroundColor: PRIMARY_RED };
    const hoverStyle = { backgroundColor: '#a9303c' };
    
    // Helper component to render the step indicator
    const StepIndicator = ({ currentStep }) => (
        <div className="flex justify-between items-center mb-10">
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${
                                s <= currentStep ? 'bg-[#CC3D4B] shadow-md' : 'bg-gray-300'
                            }`}
                        >
                            {s}
                        </div>
                        <p className={`mt-2 text-xs font-medium text-center transition-colors duration-300 ${s === currentStep ? 'text-[#CC3D4B]' : 'text-gray-500'}`}>
                            {s === 1 ? 'Personal Info' : s === 2 ? 'Security' : 'Credentials'}
                        </p>
                    </div>
                    {s < 3 && (
                        <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${s < currentStep ? 'bg-[#CC3D4B]' : 'bg-gray-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: DARK_CHARCOAL }}>Create Account</h2>
            <p className="text-center text-sm text-gray-500 mb-8">Step {step} of 3</p>

            <StepIndicator currentStep={step} />

            {message && (
                <MessageDisplay message={message} />
            )}

            <form onSubmit={handleSubmit}>
                {/* --- Step 1: Personal Info & Role --- */}
                {step === 1 && (
                    <div className="space-y-6">
                        <FormInput 
                            id="name" 
                            label="Full Name" 
                            icon={User} 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                        
                        <div className="relative p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                <Activity className="w-4 h-4 mr-2" style={{ color: PRIMARY_RED }}/>
                                Select your role
                            </label>
                            <div className="flex space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="donor"
                                        checked={formData.role === 'donor'}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4"
                                        style={{ accentColor: PRIMARY_RED }}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 font-medium">Donor</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ngo"
                                        checked={formData.role === 'ngo'}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4"
                                        style={{ accentColor: PRIMARY_RED }}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 font-medium">NGO/Charity</span>
                                </label>
                            </div>
                        </div>

                        <FormInput 
                            id="locationText" 
                            label="Location (City, State, or Org Address)" 
                            icon={MapPin} 
                            value={formData.locationText} 
                            onChange={handleChange} 
                        />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center py-3 px-6 text-white font-bold rounded-lg transition duration-200 shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                                style={buttonStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                            >
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* --- Step 2: Security & Recovery --- */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="mb-4">
                            <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC3D4B] focus:border-[#CC3D4B] transition duration-150 text-gray-700 appearance-none text-sm font-medium"
                                >
                                    {securityQuestions.map((q) => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                                <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <FormInput 
                            id="securityAnswer" 
                            label="Answer to Security Question" 
                            type="text" 
                            icon={Key} 
                            value={formData.securityAnswer} 
                            onChange={handleChange} 
                            required 
                        />

                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center py-3 px-6 text-gray-700 font-bold rounded-lg transition duration-200 shadow-md border border-gray-300 transform hover:bg-gray-100 active:scale-[0.99]"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center py-3 px-6 text-white font-bold rounded-lg transition duration-200 shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                                style={buttonStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                            >
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Step 3: Account Credentials --- */}
                {step === 3 && (
                    <div className="space-y-6">
                        <FormInput 
                            id="email" 
                            label="Email Address" 
                            type="email" 
                            name="email"
                            icon={Mail} 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                        <FormInput 
                            id="password" 
                            label="Password" 
                            type="password"
                            name="password" 
                            icon={Lock} 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />

                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center py-3 px-6 text-gray-700 font-bold rounded-lg transition duration-200 shadow-md border border-gray-300 transform hover:bg-gray-100 active:scale-[0.99]"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Previous
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    flex items-center justify-center py-3 px-6 text-white font-bold rounded-lg transition duration-200 shadow-md 
                                    transform ${!isLoading ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}
                                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                                style={buttonStyle}
                                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)}
                                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </div>
                                ) : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-600">
                Already have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToLogin}
                    className="font-extrabold ml-1 hover:underline transition duration-150 focus:outline-none"
                    style={{ color: PRIMARY_RED }}
                >
                    Log In
                </button>
            </p>
        </>
    );
};

export default SignupPage;