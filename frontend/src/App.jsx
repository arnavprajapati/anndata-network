import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import ImageSliderContainer from './ImageSliderContainer'
import LogInPage from './LogInPage'
import SignUpPage from './SignUpPage'

/**
 * Component to handle the switching between Login and Signup pages.
 * This replaces the need for a separate AuthContainer file.
 */
const AuthPage = () => {
  // Start with the Login view
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    <div className="flex justify-center items-center min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl">
        {isLogin ? (
          <LogInPage onSwitchToSignup={handleSwitchToSignup} />
        ) : (
          <SignUpPage onSwitchToLogin={handleSwitchToLogin} />
        )}
      </div>
    </div>
  );
};


const App = () => {
  return (
    <>
      <Navbar />
      
      {/* The main content area must have padding at the top (pt-20) 
        to ensure it doesn't get hidden underneath the fixed Navbar. 
      */}
      <main>
        <Routes>
          {/* Home Page Route - Renders the Image Slider */}
          <Route 
            path="/" 
            element={<ImageSliderContainer />} 
          />
          
          {/* Authentication Route - Renders the Login/Signup switcher */}
          <Route 
            path="/login" 
            element={<AuthPage />} 
          />
          
          {/* Placeholder Routes for Navbar links */}
          <Route path="/donate" element={<div className="pt-20 text-center text-xl p-8">Donate Page Placeholder</div>} />
          <Route path="/impact" element={<div className="pt-20 text-center text-xl p-8">Our Impact Page Placeholder</div>} />
          <Route path="/testimonial" element={<div className="pt-20 text-center text-xl p-8">Testimonial Page Placeholder</div>} />
          <Route path="/about" element={<div className="pt-20 text-center text-xl p-8">About Page Placeholder</div>} />

        </Routes>
      </main>
    </>
  )
}

export default App