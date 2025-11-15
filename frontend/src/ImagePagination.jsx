import React from 'react';

function ImagePagination({ currentSlideIndex, onDotClick, totalSlides = 8 }) {
    const slides = Array.from({ length: totalSlides }, (_, i) => i);

    const actionColor = '#387ED1';
    const inactiveColor = '#777777';

    return (
        <div className="flex justify-center space-x-3 p-4">
            {slides.map((index) => {
                const isActive = index === currentSlideIndex;

                return (
                    <button
                        key={index}
                        onClick={() => onDotClick(index)}
                        style={{ backgroundColor: isActive ? actionColor : inactiveColor }}
                        className={`
                            h-3 
                            rounded-full 
                            transition-all 
                            duration-300 
                            ease-in-out 
                            cursor-pointer
                            // Apply different widths based on active state (Enlarged Active Dot)
                            ${isActive ? 'w-8 shadow-lg' : 'w-3'}
                            
                            ${!isActive && 'hover:bg-opacity-70'}
                        `}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                );
            })}
        </div>
    );
}

export default ImagePagination;