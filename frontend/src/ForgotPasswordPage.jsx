import React, { useState } from 'react';
import { Mail, Key, Lock, ArrowLeft, CheckCircle, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { FormInput, MessageDisplay, PRIMARY_RED, DARK_CHARCOAL, API_BASE_URL } from './Shared';

const ForgotPasswordPage = ({ onBackToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (!email) {
            setMessage({ type: 'error', text: 'Please enter your email address.' });
            setIsLoading(false);
            return;
        }

        try {

            setStep(2);
            setSecurityQuestion('What is your mother\'s maiden name?');
            setMessage({ type: 'success', text: 'Email verified! Please answer your security question.' });

        } catch (error) {
            console.error('Verify Email Error:', error);
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySecurityAnswer = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (!securityAnswer) {
            setMessage({ type: 'error', text: 'Please provide an answer to the security question.' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-security`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    securityAnswer: securityAnswer
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetToken(data.resetToken);
                setStep(3);
                setMessage({ type: 'success', text: 'Security verified! Now create your new password.' });
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Incorrect answer. Please try again.'
                });
            }
        } catch (error) {
            console.error('Verify Security Error:', error);
            setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        if (!newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill in both password fields.' });
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resetToken: resetToken,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Password reset successful! Redirecting to login...'
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    onBackToLogin();
                }, 2000);

            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Failed to reset password. Token may have expired.'
                });
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonStyle = { backgroundColor: PRIMARY_RED };

    const ProgressBar = () => (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s < step
                                    ? 'bg-green-500 text-white'
                                    : s === step
                                        ? 'bg-[#387ED1] text-white shadow-lg scale-110'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            <p className={`mt-2 text-xs font-medium ${s === step ? 'text-[#387ED1]' : 'text-gray-500'
                                }`}>
                                {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Reset'}
                            </p>
                        </div>
                        {s < 3 && (
                            <div className={`flex-1 h-1 mx-2 transition-all duration-300 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#387ED1] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold mb-2" style={{ color: DARK_CHARCOAL }}>
                    Reset Password
                </h2>
                <p className="text-gray-500 text-sm">
                    {step === 1 && "Enter your email to get started"}
                    {step === 2 && "Answer your security question"}
                    {step === 3 && "Create your new password"}
                </p>
            </div>

            <ProgressBar />

            {message && <MessageDisplay message={message} />}

            {step === 1 && (
                <form onSubmit={handleVerifyEmail} className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="font-semibold text-blue-800">
                            Enter the email address associated with your account. We'll ask you to verify your identity.
                        </p>
                    </div>

                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform ${!isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed opacity-70'
                            } flex items-center justify-center`}
                        style={buttonStyle}
                    >
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin mr-2 h-5 w-5" />
                                Verifying...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifySecurityAnswer} className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">Security Question:</p>
                        <p className="text-gray-700">{securityQuestion}</p>
                    </div>

                    <FormInput
                        id="securityAnswer"
                        label="Your Answer"
                        type="text"
                        icon={Key}
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 flex items-center justify-center py-3.5 text-gray-700 font-bold rounded-lg transition duration-200 shadow-md border-2 border-gray-300 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform ${!isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed opacity-70'
                                }`}
                            style={buttonStyle}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin mr-2 h-5 w-5" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">
                            Identity verified! Now create a strong new password.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden transition duration-150 focus-within:ring-2 focus-within:ring-[#387ED1] focus-within:ring-offset-2">
                            <div className="pl-3 py-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full p-3 focus:outline-none placeholder-gray-500 text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="pr-3 py-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden transition duration-150 focus-within:ring-2 focus-within:ring-[#387ED1] focus-within:ring-offset-2">
                            <div className="pl-3 py-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full p-3 focus:outline-none placeholder-gray-500 text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="pr-3 py-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {newPassword && (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-600 font-semibold">Password Strength:</p>
                            <div className="flex space-x-1">
                                <div className={`h-2 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                <div className={`h-2 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                <div className={`h-2 flex-1 rounded ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {newPassword.length < 6 && "Too short"}
                                {newPassword.length >= 6 && newPassword.length < 8 && "Fair"}
                                {newPassword.length >= 8 && newPassword.length < 10 && "Good"}
                                {newPassword.length >= 10 && /[A-Z]/.test(newPassword) && "Strong"}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 text-white font-bold rounded-lg transition duration-200 shadow-lg transform ${!isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed opacity-70'
                            } flex items-center justify-center`}
                        style={buttonStyle}
                    >
                        {isLoading ? (
                            <>
                                <Loader className="animate-spin mr-2 h-5 w-5" />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            )}

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white font-semibold text-gray-500">Remember your password?</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-3 border-2 border-[#387ED1] text-[#387ED1] font-bold rounded-lg hover:bg-[#387ED1] hover:text-white transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
            </button>
        </div>
    );
};

export default ForgotPasswordPage;