import React, { useState } from 'react';

function ImagePagination({ currentSlideIndex, onDotClick, totalSlides }) {
    return (
        <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlideIndex
                        ? 'bg-green-400 w-8'
                        : 'bg-gray-400 hover:bg-gray-300'
                        }`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    );
}

import { User, X } from 'lucide-react';
function ImageSliderContainer({ onLoginRequest }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const sliderData = [
        {
            imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=600&fit=crop",
            heading: "Annदाता  ensures no meal goes to waste — ever again.",
            buttonText: "Donate now",
            buttonLink: "#"
        },
        {
            imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=600&fit=crop",
            heading: "Share what you have. Track where it goes. Help who needs it.",
            buttonText: "Donate now",
            buttonLink: "#"
        },
        {
            imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=600&fit=crop",
            heading: "Turn surplus food into hope — connect with NGOs instantly.",
            buttonText: "Donate now",
            buttonLink: "#"
        },
    ];

    const totalSlides = sliderData.length;

    const goToSlide = (index) => {
        if (index >= 0 && index < totalSlides) {
            setCurrentSlide(index);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const getPrevIndex = () => (currentSlide - 1 + totalSlides) % totalSlides;
    const getNextIndex = () => (currentSlide + 1) % totalSlides;

    const currentSlideContent = sliderData[currentSlide];

    // Handler for Donate/Learn More button
    const handleDonateClick = () => {
        setShowLoginPopup(true);
    };

    return (
        <div className="w-full py-[10%] bg-gray-100">
            <div className="relative w-full max-w-7xl mx-auto px-4">
                <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center overflow-visible">
                    {/* Previous Slide (Left) */}
                    <div className="absolute left-0 w-[15%] h-[85%] opacity-40 transition-all duration-500 hidden lg:block">
                        <img
                            src={sliderData[getPrevIndex()].imageUrl}
                            alt="Previous slide"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>

                    {/* Current Slide (Center) */}
                    <div className="relative w-full lg:w-[70%] h-full rounded-xl overflow-hidden shadow-2xl">
                        <img
                            src={currentSlideContent.imageUrl}
                            alt={`Slide ${currentSlide + 1}`}
                            className="w-full h-full object-cover transition-opacity duration-500"
                        />

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-center px-10 sm:px-12 lg:px-24 text-white z-10">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold max-w-2xl leading-tight mb-6">
                                {currentSlideContent.heading}
                            </h2>
                            <button
                                onClick={handleDonateClick}
                                className="inline-block py-3 px-8 bg-[#2d8659] hover:bg-[#50b184] transition-colors duration-300 rounded-lg text-base sm:text-lg font-semibold shadow-lg max-w-fit animate-pulse-grow"
                            >
                                {currentSlideContent.buttonText}
                            </button>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition z-20"
                            aria-label="Previous slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition z-20"
                            aria-label="Next slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Animated Login Popup */}
                        {showLoginPopup && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-scaleIn">
                                    <button
                                        className="absolute top-4 right-4 text-gray-400 hover:text-[#2d8659] transition-colors"
                                        onClick={() => setShowLoginPopup(false)}
                                        aria-label="Close"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <div className="flex flex-col items-center text-center">
                                        <User className="w-12 h-12 text-[#2d8659] mb-2 animate-pulse-grow" />
                                        <h3 className="text-2xl font-bold mb-2 text-[#1f5c3a]">Login Required</h3>
                                        <p className="text-gray-600 mb-4 font-semibold">To donate food, please log in as a <span className="text-[#2d8659]">Donor</span> or <span className="text-[#2d8659]">NGO</span>.<br />This helps us coordinate and track your impact!</p>
                                        <button
                                            className="py-3 px-8 bg-[#2d8659] hover:bg-[#52b788] text-white font-bold rounded-lg shadow-lg transition-all duration-200 animate-pulse-grow"
                                            onClick={() => {
                                                setShowLoginPopup(false);
                                                if (onLoginRequest) onLoginRequest();
                                            }}
                                        >
                                            Log In / Sign Up
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Slide (Right) */}
                    <div className="absolute right-0 w-[15%] h-[85%] opacity-40 transition-all duration-500 hidden lg:block">
                        <img
                            src={sliderData[getNextIndex()].imageUrl}
                            alt="Next slide"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                </div>

                {/* Pagination Dots */}
                <ImagePagination
                    currentSlideIndex={currentSlide}
                    onDotClick={goToSlide}
                    totalSlides={totalSlides}
                />
            </div>
        </div>
    );
}

export default ImageSliderContainer;