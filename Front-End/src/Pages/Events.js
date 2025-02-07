import React, { useEffect } from 'react';
import '../Styles/Events.css';
import { useTheme } from '../context/ThemeContext';
import gadgetsImage from '../Images/gadgets.jpg';
import accessoriesImage from '../Images/Accessories.jpg';
import booksImage from '../Images/Books.jpg';
import othersImage from '../Images/others.jpg';

const Events = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll('.event-card');
      const triggerBottom = window.innerHeight / 5 * 4;

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
    <div className={`events-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="homepage" id='events'>
        <div className="content">
          <h1 className="title">Success Stories <br/>& Community <br/>Events</h1>
          <p className="description">
            Discover heartwarming stories of reunited items <br />
            and their owners. Join our community events to help <br />
            make a difference in people's lives.
          </p>
          <button className="cta-button">View All Stories</button>
        </div>
      </div>
      
      <h1 className="events-title">Recent Success Stories</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={gadgetsImage} alt="Lost Ring Found" className="event-image" />
          <div className="event-details">
            <h3>Wedding Ring Reunited</h3>
            <p className="event-description">
              After losing her wedding ring at Central Park, Sarah thought she'd never see it again. 
              Thanks to our platform and the keen eye of John, a morning jogger, the precious ring was 
              returned within 24 hours. This heartwarming reunion shows the power of our community.
            </p>
          </div>
        </div>

        <div className="event-card">
          <div className="event-details">
            <h3>Lost Laptop Recovery</h3>
            <p className="event-description">
              A student's crucial research work was saved when their lost laptop was found and returned 
              through our platform. The finder used our quick response system to report the found item, 
              and within hours, the laptop was back in the hands of its grateful owner.
            </p>
          </div>
          <img src={accessoriesImage} alt="Laptop Return" className="event-image" />
        </div>

        <div className="event-card">
          <img src={booksImage} alt="Pet Reunion" className="event-image" />
          <div className="event-details">
            <h3>Missing Pet Located</h3>
            <p className="event-description">
              When Max the Golden Retriever went missing, his family was devastated. Our platform's 
              quick alert system and community network helped locate Max within the same day. This 
              story highlights how our platform helps reunite not just items, but beloved pets too.
            </p>
          </div>
        </div>

        <div className="event-card">
          <div className="event-details">
            <h3>Community Awareness Event</h3>
            <p className="event-description">
              Join us for our monthly community awareness event where we discuss best practices for 
              preventing loss of valuable items and what to do when you find something. Learn about 
              our platform's features and how to make the most of our lost-and-found network.
            </p>
          </div>
          <img src={othersImage} alt="Community Event" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
