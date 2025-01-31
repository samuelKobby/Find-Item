import React, { useEffect } from 'react';
import '../Styles/Events.css';
import eventImage1 from 'https://source.unsplash.com/6cL7lhb9t60'; // Image from Unsplash related to searching for items
import eventImage2 from 'https://source.unsplash.com/RmGmV9qdyF8'; // Image from Unsplash related to retail or finding products
import eventImage3 from 'https://source.unsplash.com/Ap0yt7Rb28k'; // Image from Unsplash related to shopping or discovering products
import eventImage4 from 'https://source.unsplash.com/1xOIk0V5cUQ'; // Image from Unsplash related to online stores

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
        <h1 className="title">Find Your Perfect Product</h1>
        <p className="description">
          Browse through a variety of items that suit your needs. Whether you’re looking for something specific or just browsing, we’ve got you covered. <br />Start your search now!
        </p>
        <button className="cta-button">Find Products</button>
      </div>
    </div>
      <h1 className="events-title">Featured Products</h1>
      <div className="events-content">
        <div className="event-card">
          <img src={eventImage1} alt="Product Search" className="event-image" />
          <p className="event-description">Looking for the latest trends? Explore a variety of products available for purchase and find exactly what you're looking for!</p>
        </div>
        <div className="event-card">
          <p className="event-description">Searching for the best deals on gadgets and apparel? Our platform lets you easily find the top-rated products and reviews, all in one place!</p>
          <img src={eventImage2} alt="Retail Shopping" className="event-image" />
        </div>
        <div className="event-card">
          <img src={eventImage3} alt="Product Discovery" className="event-image" />
          <p className="event-description">Join our community to discover the most popular products, compare prices, and find great discounts across various categories!</p>
        </div>
        <div className="event-card">
          <p className="event-description">Looking to buy something specific? Browse through our platform to find the perfect product from trusted sellers and vendors.</p>
          <img src={eventImage4} alt="Online Shopping" className="event-image" />
        </div>
      </div>
    </div>
  );
};

export default Events;
