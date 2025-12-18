import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DestinationCard.css';

const DestinationCard = ({ destination, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(destination);
    } else {
      // Navigate to search with attraction name as keyword
      navigate(`/search?keyword=${encodeURIComponent(destination.name)}`);
    }
  };

  return (
    <div className="destination-card" onClick={handleClick}>
      <div className="destination-image">
        <img 
          src={destination.imageUrl || '/images/default-destination.jpg'} 
          alt={destination.name}
          onError={(e) => {
            e.target.src = '/images/default-destination.jpg';
          }}
        />
        <div className="destination-overlay">
          <h3 className="destination-name">{destination.name}</h3>
          <p className="destination-location">{destination.location}</p>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
