import React, { useState, useEffect } from 'react';
import './ImageSlider.css';

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x500/6366f1/ffffff?text=No+Image';

export default function ImageSlider({ images = [], isFavorite, onToggleFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState([]);

  useEffect(() => {
    // Use placeholder if no images
    if (images.length === 0) {
      setDisplayImages([PLACEHOLDER_IMAGE]);
    } else {
      setDisplayImages(images);
    }
  }, [images]);

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="image-slider">
      {/* Favorite Toggle */}
      <button 
        className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
        onClick={onToggleFavorite}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {/* Image Container */}
      <div className="slider-container">
        {/* Left Gradient Overlay */}
        <div className="slider-gradient left"></div>
        
        {/* Main Image */}
        <div 
          className="slider-images"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayImages.map((image, index) => (
            <div key={index} className="slider-image-wrapper">
              <img 
                src={image} 
                alt={`Slide ${index + 1}`}
                className="slider-image"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Right Gradient Overlay */}
        <div className="slider-gradient right"></div>
      </div>

      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button className="slider-arrow prev" onClick={handlePrev} aria-label="Previous image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="slider-arrow next" onClick={handleNext} aria-label="Next image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {displayImages.length > 1 && (
        <div className="slider-dots">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
