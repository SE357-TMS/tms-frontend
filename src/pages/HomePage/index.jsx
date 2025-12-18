import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import customerTourService from '../../services/customerTourService';
import SearchBar from '../../components/customer/SearchBar/SearchBar';
import TourCard from '../../components/customer/TourCard/TourCard';
import DestinationCard from '../../components/customer/DestinationCard/DestinationCard';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Scroll refs for sliders
  const toursSliderRef = useRef(null);
  const destinationsSliderRef = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await customerTourService.getHomePageData(8, 8);
        // Response structure: { success, message, data: { favoriteTours, favoriteDestinations } }
        if (response && response.data) {
          setHomeData(response.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (keyword) => {
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 240; // card width + gap
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSeeMoreTours = () => {
    navigate('/search');
  };

  const handleDestinationClick = (destination) => {
    navigate(`/search?keyword=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div className="customer-home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src="/images/hero-banner.jpg" alt="Travel Banner" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>Khám phá Việt Nam cùng TMS</h1>
          <p>Tìm kiếm và đặt tour du lịch với những trải nghiệm tuyệt vời</p>
          <div className="hero-search-wrapper">
            <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm tour, địa điểm..." />
          </div>
        </div>
      </section>

      {/* Favorite Tours Section */}
      <section className="section favorite-tours-section">
        <div className="section-container">
          <div className="section-header">
            <h2>
              <span className="icon-star">★</span>
              Fav travel choice
            </h2>
            <button className="see-more-btn" onClick={handleSeeMoreTours}>
              See more
              <span className="arrow-right">→</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-skeleton">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="slider-wrapper">
              <button 
                className="slider-nav-btn prev" 
                onClick={() => scrollSlider(toursSliderRef, 'left')}
              >
                ‹
              </button>
              <div className="tours-slider" ref={toursSliderRef}>
                {homeData?.favoriteTours?.map((tour) => (
                  <TourCard key={tour.routeId} tour={tour} variant="grid" />
                ))}
              </div>
              <button 
                className="slider-nav-btn next" 
                onClick={() => scrollSlider(toursSliderRef, 'right')}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Favorite Destinations Section */}
      <section className="section favorite-destinations-section">
        <div className="section-container">
          <div className="section-header">
            <h2>
              <span className="icon-location">📍</span>
              Fav tourist destinations
            </h2>
          </div>

          {loading ? (
            <div className="loading-skeleton">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card destination"></div>
              ))}
            </div>
          ) : (
            <div className="slider-wrapper">
              <button 
                className="slider-nav-btn prev" 
                onClick={() => scrollSlider(destinationsSliderRef, 'left')}
              >
                ‹
              </button>
              <div className="destinations-slider" ref={destinationsSliderRef}>
                {homeData?.favoriteDestinations?.map((destination) => (
                  <DestinationCard 
                    key={destination.id} 
                    destination={destination}
                    onClick={handleDestinationClick}
                  />
                ))}
              </div>
              <button 
                className="slider-nav-btn next" 
                onClick={() => scrollSlider(destinationsSliderRef, 'right')}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section why-us-section">
        <div className="section-container">
          <h2>Tại sao chọn TMS?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>An toàn & Tin cậy</h3>
              <p>Đảm bảo chất lượng dịch vụ với đội ngũ chuyên nghiệp</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Giá cả hợp lý</h3>
              <p>Cam kết giá tốt nhất với nhiều ưu đãi hấp dẫn</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Đa dạng lựa chọn</h3>
              <p>Hàng ngàn tour du lịch đến mọi miền đất nước</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
