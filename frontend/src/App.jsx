import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import ImageSliderContainer from './ImageSliderContainer'
<<<<<<< HEAD
import MapPreviewSection from './MapPreviewSection'

const App = () => {
  return (
    <>
      <Navbar />
      <ImageSliderContainer />
      <MapPreviewSection />
    </>
  )
=======
import LogInPage from './LogInPage'
import SignUpPage from './SignUpPage'

/**
 * Component to handle the switching between Login and Signup pages.
 * This is now rendered inside the modal in App.jsx.
 */
const AuthPage = ({ onClose }) => {
  // Start with the Login view
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    // चौड़ाई यहाँ 'max-w-lg' में बदल दी गई है
    <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-xl relative">
        {/* Close Button for Modal */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        
        <div className="mt-4"> {/* Added margin to account for close button */}
            {isLogin ? (
                <LogInPage onSwitchToSignup={handleSwitchToSignup} />
            ) : (
                <SignUpPage onSwitchToLogin={handleSwitchToLogin} />
            )}
        </div>
    </div>
  );
};

// Modal Component with the user's requested blurred background style
const Modal = ({ children, onClose }) => {
    return (
        <div 
            // Backdrop style: bg-gray-900/70 is dark grey 70% opacity, backdrop-blur-md blurs the content behind it.
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-opacity duration-300"
            // Click on backdrop closes the modal
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Modal Content container, preventing backdrop click from closing the modal */}
            <div className="relative z-50">
                {children}
            </div>
        </div>
    );
};


const App = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    const openAuthModal = () => setShowAuthModal(true);
    const closeAuthModal = () => setShowAuthModal(false);

    // Apply filter/blur class to main content when modal is open
    const mainContentClass = showAuthModal ? 'filter blur-sm pointer-events-none' : '';

    return (
        <>
            <Navbar onLoginClick={openAuthModal} />
            
            <main className={mainContentClass} style={{ transition: 'filter 0.3s ease-out' }}>
                <Routes>
                    {/* Home Page Route - Renders the Image Slider */}
                    <Route 
                        path="/" 
                        element={<ImageSliderContainer />} 
                    />
                    
                    {/* Placeholder Routes for Navbar links */}
                    <Route path="/donate" element={<div className="pt-20 text-center text-xl p-8">Donate Page Placeholder</div>} />
                    <Route path="/impact" element={<div className="pt-20 text-center text-xl p-8">Our Impact Page Placeholder</div>} />
                    <Route path="/testimonial" element={<div className="pt-20 text-center text-xl p-8">Testimonial Page Placeholder</div>} />
                    <Route path="/about" element={<div className="pt-20 text-center text-xl p-8">About Page Placeholder</div>} />
                </Routes>
            </main>

            {/* Authentication Modal */}
            {showAuthModal && (
                <Modal onClose={closeAuthModal}>
                    <AuthPage onClose={closeAuthModal} />
                </Modal>
            )}
        </>
    )
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3
}

export default App