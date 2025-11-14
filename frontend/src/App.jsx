import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import ImageSliderContainer from './ImageSliderContainer';
import LogInPage from './LogInPage';
import SignUpPage from './SignUpPage';

// Component to toggle Login/Signup inside modal
const AuthPage = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-xl relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
      >
        ✕
      </button>

      <div className="mt-4">
        {isLogin ? (
          <LogInPage onSwitchToSignup={handleSwitchToSignup} />
        ) : (
          <SignUpPage onSwitchToLogin={handleSwitchToLogin} />
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className="relative z-50">{children}</div>
  </div>
);

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const mainContentClass = showAuthModal ? 'filter blur-sm pointer-events-none' : '';

  return (
    <>
      <Navbar onLoginClick={openAuthModal} />

      <main className={mainContentClass} style={{ transition: 'filter 0.3s ease-out' }}>
        <Routes>
          <Route path="/" element={<ImageSliderContainer />} />

          <Route path="/donate" element={<div className="pt-20 text-center text-xl p-8">Donate Page</div>} />
          <Route path="/impact" element={<div className="pt-20 text-center text-xl p-8">Our Impact Page</div>} />
          <Route path="/testimonial" element={<div className="pt-20 text-center text-xl p-8">Testimonials</div>} />
          <Route path="/about" element={<div className="pt-20 text-center text-xl p-8">About Page</div>} />
        </Routes>
      </main>

      {showAuthModal && (
        <Modal onClose={closeAuthModal}>
          <AuthPage onClose={closeAuthModal} />
        </Modal>
      )}
    </>
  );
};

export default App;
