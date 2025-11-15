import React, { useState } from 'react';
import ImagePagination from './ImagePagination';

function ImageSliderContainer() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const sliderData = [
        {
            imageUrl: "https://b.zmtcdn.com/data/o2_assets/a6df64139b380317b13dca3148ca9b0f1745347435.jpeg",
            heading: "Help Ashok Deshmane give orphans of farmer suicides a loving home",
            buttonText: "Donate now",
            buttonLink: "/login"
        },
        {
            imageUrl: "https://b.zmtcdn.com/data/o2_assets/a6df64139b380317b13dca3148ca9b0f1745347435.jpeg",
            heading: "Support our mission to rescue children from trafficking and terrors in red light areas",
            buttonText: "Donate now",
            buttonLink: "/login"
        },
        {
            imageUrl: "https://b.zmtcdn.com/data/o2_assets/a6df64139b380317b13dca3148ca9b0f1745347435.jpeg",
            heading: "Another great cause needs your help today to build a better future",
            buttonText: "Learn More",
            buttonLink: "/login"
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

    const currentSlideContent = sliderData[currentSlide];

    return (
        <div className="relative w-full h-[814px] overflow-hidden">
            <img
                src={currentSlideContent.imageUrl}
                alt={`Slide ${currentSlide + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />

            <div className="absolute inset-0 bg-opacity-50"></div>

            <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-20 text-white z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold max-w-2xl leading-tight mb-6">
                    {currentSlideContent.heading}
                </h2>
                <a
                    href={currentSlideContent.buttonLink}
                    className="inline-block py-3 px-8 bg-[#387ED1] hover:bg-black transition-colors duration-300 rounded text-lg font-semibold shadow-md max-w-fit"
                >
                    {currentSlideContent.buttonText}
                </a>
            </div>

            <div className="absolute bottom-4 left-0 right-0 z-20">
                <ImagePagination
                    currentSlideIndex={currentSlide}
                    onDotClick={goToSlide}
                    totalSlides={totalSlides}
                />
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75 transition z-20"
            >
                &lt;
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75 transition z-20"
            >
                &gt;
            </button>
        </div>
    );
}

export default ImageSliderContainer;