import React, { useEffect } from 'react';
import '../Styles/Events.css';
import eventImage1 from 'https://images.unsplash.com/photo-1593682617243-68b9f83e53b2'; // Lost item image 1
import eventImage2 from 'https://images.unsplash.com/photo-1586444639847-0d50c6ef02c9'; // Lost item image 2
import eventImage3 from 'https://images.unsplash.com/photo-1603766795718-621ccf9917e2'; // Lost item image 3
import eventImage4 from 'https://images.unsplash.com/photo-1575084190553-c1ea9020f3a4'; // Lost item image 4

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
          <h1 className="title">Find Your Lost Item</h1>
          <p className="description">
            If you've misplaced something, don't worry! Explore a range of lost item reports and events where you can track and recover your belongings. <br />We are here to help!
          </p>
          <button className="cta-button">Find Lost Items</button>
        </div>
      </div>
      <h1 className="events-title">Upcoming Lost Items</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={eventImage1} alt="Lost Item 1" className="event-image" />
          <p className="event-description">Lost Wallet – Join our event to track down a missing wallet. We’ll help you find it!</p>
        </div>
        <div className="event-card">
          <p className="event-description">Missing Laptop – If you lost your laptop, don’t miss out on our event dedicated to tracking it down!</p>
          <img src={eventImage2} alt="Lost Item 2" className="event-image" />
        </div>
        <div className="event-card">
          <img src={eventImage3} alt="Lost Item 3" className="event-image" />
          <p className="event-description">Lost Phone – Is your phone missing? Join our event to report it and get updates on its recovery.</p>
        </div>
        <div className="event-card">
          <p className="event-description">Found Backpack – We found a backpack! If it's yours, come check it out at our event.</p>
          <img src={eventImage4} alt="Lost Item 4" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
