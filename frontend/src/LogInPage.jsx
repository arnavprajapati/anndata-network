import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { FormInput, MessageDisplay, DARK_CHARCOAL, API_BASE_URL } from './Shared';
import ForgotPasswordPage from './ForgotPasswordPage';

const LogInPage = ({ onSwitchToSignup, onAuthSuccess }) => {
    const THEME_GREEN = "#2D8659";

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    if (showForgotPassword) {
        return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (message) setMessage(null);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (onAuthSuccess) {
                    onAuthSuccess({ token: data.token, user: data.user });
                }
                setMessage({ type: 'success', text: `Welcome back, ${data.user.name}!` });
            } else {
                setMessage({ type: 'error', text: data.message || 'Login failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn max-w-sm mx-auto px-2">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: DARK_CHARCOAL }}>Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-1 font-medium">Log in to continue making a difference</p>
            </div>

            {message && <MessageDisplay message={message} />}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <FormInput
                    id="email"
                    label="EMAIL ADDRESS"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-50 border-none rounded-2xl p-4"
                />

                <div className="relative">
                    <FormInput
                        id="password"
                        label="PASSWORD"
                        type={showPassword ? "text" : "password"}
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="bg-gray-50 border-none rounded-2xl p-4 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 mt-3 text-gray-400 hover:text-gray-600 transition"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="text-right -mt-2">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[10px] font-bold tracking-widest uppercase hover:opacity-70 transition duration-150"
                        style={{ color: THEME_GREEN }}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition duration-200 transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                    style={{
                        backgroundColor: THEME_GREEN,
                        boxShadow: `0 10px 15px -3px ${THEME_GREEN}33`
                    }}
                >
                    {isLoading ? (
                        <>
                            <Loader className="animate-spin mr-2 h-4 w-4" />
                            Logging In...
                        </>
                    ) : (
                        'Log In'
                    )}
                </button>
            </form>

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="px-4 bg-white text-gray-400">Or</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onSwitchToSignup}
                className="w-full py-4 border-2 font-bold text-xs uppercase tracking-widest rounded-2xl transition duration-200 hover:bg-gray-50 active:scale-[0.98]"
                style={{ borderColor: THEME_GREEN, color: THEME_GREEN }}
            >
                Create New Account
            </button>
        </div>
    );
};

export default LogInPage;