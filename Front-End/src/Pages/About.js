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
          <div className="about-header" style={{ backgroundImage: `url(${Bobg})` }}>
            <h1>About Us</h1>
          </div>
          <div className="team-section">
            <div className="team-member">
              <img src={team1} alt="Team Member 1" />
              <h3>John Doe</h3>
              <p>Founder</p>
            </div>
            <div className="team-member">
              <img src={team2} alt="Team Member 2" />
              <h3>Jane Smith</h3>
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
  );
};

export default About;
