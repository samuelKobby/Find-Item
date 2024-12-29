import React, { useEffect } from 'react';
import '../Styles/Home.css';
import '../Styles/ScrollToTop.css';
import image from '../Images/Picture1.png';
import bablue from '../Images/Picture2.png';
import bobablu from '../Images/Picture3.jpg';
import bobabl from '../Images/Picture4.jpg';
import bobab from '../Images/Picture5.webp';
import bobatea from '../Images/New-Ghana-Card-Mockup-optimized.png';
import Cocktailalcohol from '../Images/Bags.jpg';
import mocktailalcohol from '../Images/Accessories.jpg';
import straw from '../Images/Books.jpg';
import nonalco from '../Images/gadgets.jpg';
import mockn from '../Images/others.jpg';
import reviewImage from '../Images/profile.jpeg';
import ScrollToTop from '../components/ScrollToTop';

const images = [bablue, bobablu, bobabl, bobab];

const Home = () => {
  useEffect(() => {
    const homepage = document.getElementById('homepage');
    let currentImageIndex = 0;

    homepage.style.backgroundImage = `url(${images[currentImageIndex]})`;
    const changeBackgroundImage = () => {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      homepage.style.backgroundImage = `url(${images[currentImageIndex]})`;
      homepage.classList.add('slide-in');
      setTimeout(() => {
        homepage.classList.remove('slide-in');
      }, 3000); 
    };
    const intervalId = setInterval(changeBackgroundImage, 4000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div className="homepage" id="homepage">
        <div className="content" id="content">
          <h1 className="title" id="title">Find What You Lost, <br /> Quickly and Easily.</h1>
          <p className="description" id="description">
            Lost your ID card, bag, or an accessory in the library? <br />
            Our platform connects you to items found by Balme Library officers. <br />
            Helping students reclaim their belongings effortlessly.
          </p>
          <a href="./products"><button id="cta-button" className="cta-button">Search Items</button></a>
        </div>
      </div>
      <div className="section2" id="section2">
        <div className="image-container">
          <img src={image} alt="Lost items" />
        </div>
        <div className="text-container">
          <h3>Why Choose Us?</h3>
          <h2>Helping You Find What Matters</h2>
          <p>We ensure a smooth and fast process for locating lost items found in the Balme Library. Trust us to reconnect you with your belongings.</p>
          <a href="./about"><button className="cta-button">
            Learn More
          </button></a>
        </div>
      </div>
      <div className="section3" id="section3">
        <div className="header">
          <h2>Lost & Found Categories</h2>
          <p>Explore the categories of items found and reclaim them with ease.</p>
        </div>
        <div className="grid">
          <div className="grid-item">
            <div className="circle">
              <img src={bobatea} alt="ID Cards" />
            </div>
            <p>ID Cards</p>
          </div>
          <div className="grid-item">
            <div className="circle">
              <img src={Cocktailalcohol} alt="Bags" />
            </div>
            <p>Bags</p>
          </div>
          <div className="grid-item">
            <div className="circle">
              <img src={mocktailalcohol} alt="Accessories" />
            </div>
            <p>Accessories</p>
          </div>
          <div className="grid-item">
            <div className="circle">
              <img src={straw} alt="Books" />
            </div>
            <p>Books</p>
          </div>
          <div className="grid-item">
            <div className="circle">
              <img src={nonalco} alt="Gadgets" />
            </div>
            <p>Gadgets</p>
          </div>
          <div className="grid-item">
            <div className="circle">
              <img src={mockn} alt="Others" />
            </div>
            <p>Other Items</p>
          </div>
        </div>
        <a href="./products"><button id="cta-button" className="cta-button">
          View All
        </button></a>
      </div>
      <div className="section4" id="section4">
        <div className="header">
          <h2>Student Reviews</h2>
          <p>See what others are saying about our platform and how it has helped them.</p>
        </div>
        <div className="reviews">
          <div className="review-card">
            <img src={reviewImage} alt="Reviewer" className="review-image" />
            <div className="review-text">
              <p>This platform helped me find my lost ID card within a day! Amazing service by the Balme Library team.</p>
              <p>- John Doe -</p>
              <div className="stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
            </div>
          </div>
          <div className="review-card">
            <img src={reviewImage} alt="Reviewer" className="review-image" />
            <div className="review-text">
              <p>Found my misplaced bag here. The process was seamless and very helpful!</p>
              <p>- Jane Smith -</p>
              <div className="stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Home;
