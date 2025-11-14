import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { FormInput, MessageDisplay, PRIMARY_RED, DARK_CHARCOAL } from './Shared';

// IMPORTANT: Replace this with your actual backend URL (e.g., http://localhost:5000)
const API_BASE_URL = 'http://localhost:5000'; 

const LogInPage = ({ onSwitchToSignup }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email and password are required for login.' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login (Status 200)
                // In a real app, you would save the 'token' here (e.g., in localStorage)
                console.log('Login successful. Token received:', data.token);
                setMessage({ 
                    type: 'success', 
                    text: `Login successful! Welcome back, ${data.user.name || formData.email}.` 
                });
                setFormData(prev => ({ ...prev, password: '' }));

            } else {
                // Handle 400, 401, 404 errors from the backend
                setMessage({ 
                    type: 'error', 
                    text: data.message || 'Login failed. Please check your credentials.' 
                });
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessage({ type: 'error', text: 'A network error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    // ... (rest of the component structure remains the same)
    const buttonStyle = { backgroundColor: PRIMARY_RED };
    const hoverStyle = { backgroundColor: '#a9303c' };

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: DARK_CHARCOAL }}>Log In</h2>

            {message && (
                <MessageDisplay message={message} />
            )}

            <form onSubmit={handleSubmit}>
                <FormInput 
                    id="email" 
                    label="Email Address" 
                    type="email" 
                    icon={Mail} 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
                <FormInput 
                    id="password" 
                    label="Password" 
                    type="password" 
                    icon={Lock} 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                        w-full py-3 mt-6 text-white font-bold rounded-lg transition duration-200 shadow-md 
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
                            Logging In...
                        </div>
                    ) : 'Log In'}
                </button>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToSignup}
                    className="font-extrabold ml-1 hover:underline transition duration-150 focus:outline-none"
                    style={{ color: PRIMARY_RED }}
                >
                    Sign Up
                </button>
            </p>
        </>
    );
};

export default LogInPage;