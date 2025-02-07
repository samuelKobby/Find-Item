import React from 'react';
import '../Styles/About.css';
import '../Styles/ScrollToTop.css';
import ScrollToTop from '../components/ScrollToTop';
import team1 from '../Images/CEO.jpg';
import team2 from '../Images/HC.jpg';
import team3 from '../Images/bob6.png';
import Bobg from '../Images/Picture12.webp';

const About = () => {
  return (
    <div>
      <div className="about-us">
      <section>
            <div className="homepage" id='about'>
              <div className="content">
                <h1 className="title">How Well <br />Do <span className='U-text'>U </span>Know Us</h1>
                <p className="description">
                  Find Item is a platform that connects students with their lost belongings. <br />
                  From ID cards to accessories, we're here to help reunite you <br />
                  with your items found by the Balme Library officers.
                </p>
                <button className="cta-button">Know More</button>
              </div>
            </div>
            <div className="section2">
              <div className="image-container">
                <img src={Bobg} alt="Drinks" />
              </div>
              <div className="text-container">
                <h3>What is that special thing about us?</h3>
                <h1>Our Mission</h1>
                <p>Reducing the stress of finding lost belongings. Helping students find their belongings quickly and easily.<br />
                Making sure the found items goes to the right owner</p>
                <button className="cta-button">We found it</button>
              </div>
            </div>
        </section>
        <section id="about-us-what">
              <div>
                  <h2>Why Choose Us</h2>
                  <div id="features">
                      <div className="feature">
                          <i class="fas fa-smile"></i>
                          <p>Stress Free</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-handshake"></i>
                          <p>Easy to Find</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-lock"></i>
                          <p>Secure your belongings</p>
                      </div>
                      <div className="feature">
                          <i class="fas fa-book"></i>
                          <p>Book your item </p>
                      </div>
                  </div>
              </div>
          </section>
        <section>
         
          <div className="team-section">
            <div className="team-member">
              <img src={team1} alt="Team Member 1" />
              <h3>Samuel Gyasi Fordjour</h3>
              <p>Founder</p>
            </div>
            <div className="team-member">
              <img src={team2} alt="Team Member 2" />
              <h3>Anastacia Andoh</h3>
              <p>Head Chef</p>
            </div>
            <div className="team-member">
              <img src={team3} alt="Team Member 3" />
              <h3>Mike Johnson</h3>
              <p>Manager</p>
            </div>
          </div>
        </section>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default About;
