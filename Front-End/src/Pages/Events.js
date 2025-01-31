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

  return (
    <div className="events-container">
      <div className="homepage" id='events'>
      <div className="content">
        <h1 className="title">Find Your Perfect Event</h1>
        <p className="description">
          Explore a wide range of events that cater to every interest. Whether it's a casual gathering or a special celebration, find the perfect event to attend. <br />We have something for everyone.
        </p>
        <button className="cta-button">Find Events</button>
      </div>
    </div>
      <h1 className="events-title">Upcoming Events</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={eventImage1} alt="Event 1" className="event-image" />
          <p className="event-description">Looking for a fun boba tea event? Join us for a night of tastings, special flavors, and giveaways. Don’t miss out!</p>
        </div>
        <div className="event-card">
          <p className="event-description">Get ready for an exciting evening of non-alcoholic drinks, mocktails, and socializing with friends. Perfect for anyone looking to relax and enjoy good company!</p>
          <img src={eventImage2} alt="Event 2" className="event-image" />
        </div>
        <div className="event-card">
          <img src={eventImage3} alt="Event 3" className="event-image" />
          <p className="event-description">Join our boba event for a unique experience where you can create your own drinks and discover new flavors. A perfect event for boba lovers!</p>
        </div>
        <div className="event-card">
          <p className="event-description">Come along to our non-alcoholic drinks gathering. Sip on delicious mocktails and mingle with like-minded people. A fun and refreshing way to spend your evening!</p>
          <img src={eventImage4} alt="Event 4" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
