import React, { useState, useRef, useEffect } from 'react';
import './ItinerarySlider.css';

export default function ItinerarySlider({ itinerary = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const sliderRef = useRef(null);

  // Update visible count based on screen width
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, itinerary.length - visibleCount);

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="itinerary-empty">
        <p>No itinerary available for this route.</p>
      </div>
    );
  }

  return (
    <div className="itinerary-slider">
      <div className="itinerary-header">
        <h2 className="itinerary-title">ITINERARY</h2>
        <div className="itinerary-nav">
          <button 
            className="nav-btn prev" 
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="nav-btn next" 
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="itinerary-content">
        {/* Progress bar */}
        <div className="itinerary-progress">
          {itinerary.map((_, index) => (
            <div key={index} className="progress-segment">
              <div 
                className={`progress-dot ${index <= currentIndex + visibleCount - 1 ? 'active' : ''}`}
              >
                <span className="day-number">{index + 1}</span>
              </div>
              {index < itinerary.length - 1 && (
                <div className={`progress-line ${index < currentIndex + visibleCount - 1 ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Day cards */}
        <div className="itinerary-cards-container">
          <div 
            className="itinerary-cards"
            ref={sliderRef}
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {itinerary.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className="day-card"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="day-card-inner">
                  <div className="day-header">
                    <span className="day-label">Day {day.dayNumber || dayIndex + 1}</span>
                    <span className="day-date">{day.date || ''}</span>
                  </div>
                  
                  <div className="attractions-list">
                    {day.attractions && day.attractions.map((attraction, attrIndex) => (
                      <div key={attrIndex} className="attraction-item">
                        <div className="attraction-image">
                          {attraction.imageUrl ? (
                            <img src={attraction.imageUrl} alt={attraction.name} />
                          ) : (
                            <div className="image-placeholder">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="attraction-info">
                          <h4 className="attraction-name">{attraction.name}</h4>
                          {attraction.description && (
                            <p className="attraction-description">{attraction.description}</p>
                          )}
                          {attraction.visitTime && (
                            <div className="attraction-time">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 3.5V7L9.33333 8.16667M12.25 7C12.25 9.8995 9.8995 12.25 7 12.25C4.1005 12.25 1.75 9.8995 1.75 7C1.75 4.1005 4.1005 1.75 7 1.75C9.8995 1.75 12.25 4.1005 12.25 7Z" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>{attraction.visitTime}</span>
                            </div>
                          )}
                          {attraction.categories && attraction.categories.length > 0 && (
                            <div className="attraction-categories">
                              {attraction.categories.map((cat, catIndex) => (
                                <span key={catIndex} className="category-badge">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!day.attractions || day.attractions.length === 0) && (
                      <div className="no-attractions">
                        <p>No attractions scheduled for this day.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
