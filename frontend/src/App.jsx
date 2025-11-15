import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import ImageSliderContainer from './ImageSliderContainer'
import LogInPage from './LogInPage'
import SignUpPage from './SignUpPage'
import DonorDashboard from './DonorDashboard'
import NgoDashboard from './NgoDashboard'

const AUTH_TOKEN_KEY = 'authToken';
const USER_ROLE_KEY = 'userRole';
const USER_NAME_KEY = 'userName';
const USER_ID_KEY = 'userId';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

const AuthPage = ({ onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);

    const handleSwitchToSignup = () => setIsLogin(false);
    const handleSwitchToLogin = () => setIsLogin(true);

    return (
        <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-2xl relative animate-fadeIn">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 transition-colors duration-200 transform"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="mt-4">
                {isLogin ? (
                    <LogInPage onSwitchToSignup={handleSwitchToSignup} onAuthSuccess={onAuthSuccess} />
                ) : (
                    <SignUpPage onSwitchToLogin={handleSwitchToLogin} onSignupSuccess={onAuthSuccess} />
                )}
            </div>
        </div>
    );
};

const Modal = ({ children, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="relative z-50 animate-scaleIn">
                {children}
            </div>
        </div>
    );
};


const App = () => {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem(IS_LOGGED_IN_KEY) === 'true');
    const [userRole, setUserRole] = useState(localStorage.getItem(USER_ROLE_KEY) || null);
    const [userName, setUserName] = useState(localStorage.getItem(USER_NAME_KEY) || null);

    useEffect(() => {
        const storedLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
        const storedRole = localStorage.getItem(USER_ROLE_KEY);
        const storedName = localStorage.getItem(USER_NAME_KEY);

        if (storedLoggedIn && storedRole) {
            setIsLoggedIn(true);
            setUserRole(storedRole);
            setUserName(storedName);
        }
    }, []);

    const openAuthModal = () => setShowAuthModal(true);
    const closeAuthModal = () => setShowAuthModal(false);

    const handleAuthSuccess = ({ token, user }) => {
        console.log('Auth Success:', { token, user });
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(IS_LOGGED_IN_KEY, 'true');
        localStorage.setItem(USER_ROLE_KEY, user.role);
        localStorage.setItem(USER_NAME_KEY, user.name);
        if (user._id) {
            localStorage.setItem(USER_ID_KEY, user._id);
        }

        setIsLoggedIn(true);
        setUserRole(user.role);
        setUserName(user.name);

        closeAuthModal();

        setTimeout(() => {
            if (user.role === 'donor') {
                navigate('/dashboard');
            } else if (user.role === 'ngo') {
                navigate('/ngo-dashboard');
            }
        }, 300);
    };

    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_ROLE_KEY);
        localStorage.removeItem(USER_NAME_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.setItem(IS_LOGGED_IN_KEY, 'false');

        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);

        navigate('/');
    };

    const mainContentClass = showAuthModal ? 'filter blur-sm pointer-events-none' : '';

    return (
        <>
            <Navbar
                onLoginClick={openAuthModal}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                userRole={userRole}
                userName={userName}
            />

            <main className={mainContentClass} style={{ transition: 'filter 0.3s ease-out' }}>
                {isLoggedIn ? (
                    <Routes>
                        <Route
                            path="/dashboard"
                            element={userRole === 'donor' ? (
                                <DonorDashboard onLogout={handleLogout} />
                            ) : (
                                <div className="pt-20 text-center p-8">Access Denied - Donor Only</div>
                            )}
                        />
                        <Route
                            path="/ngo-dashboard"
                            element={userRole === 'ngo' ? (
                                <NgoDashboard onLogout={handleLogout} />
                            ) : (
                                <div className="pt-20 text-center p-8">Access Denied - NGO Only</div>
                            )}
                        />
                        <Route
                            path="/*"
                            element={userRole === 'donor' ? (
                                <DonorDashboard onLogout={handleLogout} />
                            ) : userRole === 'ngo' ? (
                                <NgoDashboard onLogout={handleLogout} />
                            ) : (
                                <div className="pt-20 text-center p-8">Loading...</div>
                            )}
                        />
                    </Routes>
                ) : (
                    <Routes>
                        <Route
                            path="/"
                            element={<ImageSliderContainer />}
                        />
                        <Route path="/donate" element={
                            <div className="pt-24 px-4 sm:px-6 lg:px-20 py-12">
                                <h1 className="text-4xl font-bold text-[#333333] mb-6">Make a Donation</h1>
                                <p className="text-lg text-gray-600">Help us make a difference. Your donation matters.</p>
                            </div>
                        } />
                        <Route path="/impact" element={
                            <div className="pt-24 px-4 sm:px-6 lg:px-20 py-12">
                                <h1 className="text-4xl font-bold text-[#333333] mb-6">Our Impact</h1>
                                <p className="text-lg text-gray-600">See how your contributions are changing lives.</p>
                            </div>
                        } />
                        <Route path="/testimonial" element={
                            <div className="pt-24 px-4 sm:px-6 lg:px-20 py-12">
                                <h1 className="text-4xl font-bold text-[#333333] mb-6">Testimonials</h1>
                                <p className="text-lg text-gray-600">Read stories from our community.</p>
                            </div>
                        } />
                        <Route path="/about" element={
                            <div className="pt-24 px-4 sm:px-6 lg:px-20 py-12">
                                <h1 className="text-4xl font-bold text-[#333333] mb-6">About Us</h1>
                                <p className="text-lg text-gray-600">Learn about our mission and values.</p>
                            </div>
                        } />
                    </Routes>
                )}
            </main>

            {showAuthModal && (
                <Modal onClose={closeAuthModal}>
                    <AuthPage
                        onClose={closeAuthModal}
                        onAuthSuccess={handleAuthSuccess}
                    />
                </Modal>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slideDown {
                    from { max-height: 0; opacity: 0; }
                    to { max-height: 500px; opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </>
    )
}

export default App