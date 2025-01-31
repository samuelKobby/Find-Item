import React, { useEffect } from 'react';
import '../Styles/Events.css';
import eventImage1 from '../Images/found_item1.png';
import eventImage2 from '../Images/found_item2.png';
import eventImage3 from '../Images/found_item3.png';
import eventImage4 from '../Images/found_item4.png';

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
        <h1 className="title">Lost & Found <br/>Helping You <br/>Reunite with Items.</h1>
        <p className="description">
          Our platform helps you track and recover lost items. <br />Report lost items, browse found reports,<br /> 
          and connect with finders to get your belongings back.<br />Join our community effort today!
        </p>
        <button className="cta-button">Explore Reports</button>
      </div>
    </div>
      <h1 className="events-title">Recent Finds</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={eventImage1} alt="Lost Wallet" className="event-image" />
          <p className="event-description">A black leather wallet was found near the library entrance. Contains student ID and bank cards. If this belongs to you, please contact the admin office.</p>
        </div>
        <div className="event-card">
          <p className="event-description">A red backpack was left in the cafeteria. It contains textbooks and a water bottle. If it's yours, visit the lost & found section in the admin block.</p>
          <img src={eventImage2} alt="Lost Backpack" className="event-image" />
        </div>
        <div className="event-card">
          <img src={eventImage3} alt="Lost Phone" className="event-image" />
          <p className="event-description">A white iPhone was found near the sports complex. It's locked and has a cracked screen. Contact security with proof of ownership.</p>
        </div>
        <div className="event-card">
          <p className="event-description">A set of keys was discovered in the admin block. It has a blue keychain. If these belong to you, claim them at the security office.</p>
          <img src={eventImage4} alt="Lost Keys" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
