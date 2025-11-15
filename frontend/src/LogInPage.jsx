import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { FormInput, MessageDisplay, PRIMARY_RED, DARK_CHARCOAL, API_BASE_URL } from './Shared';
import ForgotPasswordPage from './ForgotPasswordPage';

const LogInPage = ({ onSwitchToSignup, onAuthSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // If forgot password is active, render that component
    if (showForgotPassword) {
        return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setMessage(null); // Clear message on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email and password are required.' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'lication/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Call the unified success handler
                if (onAuthSuccess) {
                    onAuthSuccess({
                        token: data.token,
                        user: data.user
                    });
                }

                setMessage({
                    type: 'success',
                    text: `Welcome back, ${data.user.name}!`
                });

            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Login failed. Please check your credentials.'
                });
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonStyle = { backgroundColor: PRIMARY_RED };

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: DARK_CHARCOAL }}>
                    Welcome Back
                </h2>
                <p className="text-gray-500 text-sm font-semibold">
                    Log in to continue making a difference
                </p>
            </div>

            {message && <MessageDisplay message={message} />}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="relative">
                    <div className="relative mb-6">
                        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden transition duration-150 focus-within:ring-2 focus-within:ring-[#387ED1] focus-within:ring-offset-2">
                            <div className="pl-3 py-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
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
                </div>

                <div className="text-right -mt-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-semibold hover:underline transition duration-150"
                        style={{ color: PRIMARY_RED }}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                        w-full py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg 
                        transform ${!isLoading ? 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl' : 'cursor-not-allowed opacity-70'}
                        flex items-center justify-center
                    `}
                    style={buttonStyle}
                >
                    {isLoading ? (
                        <>
                            <Loader className="animate-spin mr-2 h-5 w-5" />
                            Logging In...
                        </>
                    ) : (
                        'Log In'
                    )}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 font-semibold bg-white text-gray-500">Don't have an account?</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onSwitchToSignup}
                className="w-full py-3 border-2 border-[#387ED1] text-[#387ED1] font-bold rounded-lg hover:bg-[#387ED1] hover:text-white transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                Create New Account
            </button>
        </div>
    );
};

export default LogInPage;