import React, { useEffect } from 'react';
import '../Styles/Events.css';
import eventImage1 from '../Images/bobablue.png';
import eventImage2 from '../Images/bob1.png';
import eventImage3 from '../Images/boba.png';
import eventImage4 from '../Images/Nonalcohol.png';

const Events = () => {
  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll('.event-card');
      const triggerBottom = window.innerHeight / 5 * 5;

      cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;

        if (cardTop < triggerBottom) {
          card.classList.add('show');
        } else {
          card.classList.remove('show');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const titleStyle = {
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)', // Optional shadow for better visibility
  };

  const descriptionStyle = {
    color: 'white',
    fontSize: '1.25rem',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.6',
  };

  const eventDescriptionStyle = {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'left',
    margin: '10px',
    lineHeight: '1.6',
  };

  const ctaButtonStyle = {
    backgroundColor: '#ff6347',
    color: 'white',
    padding: '12px 24px',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const ctaButtonHoverStyle = {
    backgroundColor: '#ff4500', // Darker shade on hover
  };

  return (
    <div className="events-container">
      <div className="homepage" id='events'>
        <div className="content">
          <h1 className="title" style={titleStyle}>Find Your Perfect Event</h1>
          <p className="description" style={descriptionStyle}>
            Explore a wide range of events that cater to every interest. Whether it's a casual gathering or a special celebration, find the perfect event to attend. <br />We have something for everyone.
          </p>
          <button className="cta-button" style={ctaButtonStyle}>Find Events</button>
        </div>
      </div>
      <h1 className="events-title" style={titleStyle}>Upcoming Events</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={eventImage1} alt="Event 1" className="event-image" />
          <p className="event-description" style={eventDescriptionStyle}>Looking for a fun boba tea event? Join us for a night of tastings, special flavors, and giveaways. Don’t miss out!</p>
        </div>
        <div className="event-card">
          <p className="event-description" style={eventDescriptionStyle}>Get ready for an exciting evening of non-alcoholic drinks, mocktails, and socializing with friends. Perfect for anyone looking to relax and enjoy good company!</p>
          <img src={eventImage2} alt="Event 2" className="event-image" />
        </div>
        <div className="event-card">
          <img src={eventImage3} alt="Event 3" className="event-image" />
          <p className="event-description" style={eventDescriptionStyle}>Join our boba event for a unique experience where you can create your own drinks and discover new flavors. A perfect event for boba lovers!</p>
        </div>
        <div className="event-card">
          <p className="event-description" style={eventDescriptionStyle}>Come along to our non-alcoholic drinks gathering. Sip on delicious mocktails and mingle with like-minded people. A fun and refreshing way to spend your evening!</p>
          <img src={eventImage4} alt="Event 4" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
