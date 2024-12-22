import React from 'react';
import '../Styles/About.css';
import team1 from '../Images/bo4.png';
import team2 from '../Images/bob5.png';
import team3 from '../Images/bob6.png';
import Bobg from '../Images/Picture12.webp';

const About = () => {
  return (
      <div className="about-us">
        <section>
            <div className="homepage" id='about'>
              <div className="content">
                <h1 className="title">How Well <br />Do <span className='U-text'>U </span>Know Us?</h1>
                <p className="description">
                  We're on a mission to help students reconnect with their <br />
                  belongings, one item at a time. From ID cards to accessories, <br />
                  we make it easier to find what you've lost. <br />
                  Trust us to keep you connected.
                </p>
                <button className="cta-button">Learn More</button>
              </div>
            </div>
            <div className="section2">
              <div className="image-container">
                <img src={Bobg} alt="Lost Items" />
              </div>
              <div className="text-container">
                <h3>What Sets Us Apart?</h3>
                <h1>Our Mission</h1>
                <p>
                  We provide a streamlined, efficient system to reunite students <br />
                  with their lost belongings, ensuring trust, reliability, and fast service. <br />
                  Let us be the bridge between you and your missing items.
                </p>
                <button className="cta-button">Find Your Item</button>
              </div>
            </div>
        </section>
        <section id="about-us-what">
              <div>
                  <h2>Why Choose Us?</h2>
                  <div id="features">
                      <div className="feature">
                          <i class="fas fa-check-circle"></i>
                          <p>Reliable Services</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-search-location"></i>
                          <p>Effortless Search</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-users"></i>
                          <p>Community-Driven</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-thumbs-up"></i>
                          <p>Trustworthy</p>
                      </div>
                  </div>
              </div>
          </section>
      </div>
  );
};

export default About;
