import React, { useRef } from 'react';
import '../Styles/Contact.css';
import '../Styles/ScrollToTop.css';
import ScrollToTop from '../components/ScrollToTop';

const Contact = () => {
  const contactSectionRef = useRef(null);

  const handleScrollToContact = () => {
    contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div className="homepage" id='contact'>
      <div className="content">
        <h1 className="title">Get In Touch <br /> with Us.</h1>
        <p className="description">
          We’re here to help! Whether you have questions, <br />need support, or just want to connect, feel free to reach out to us.<br /> 
          Our team is dedicated to providing you with the best possible experience. <br />Use the form below to get in touch,<br /> or explore our contact details for other ways to connect. <br /> Let’s start a conversation today!
        </p>
        <button className="cta-button" onClick={handleScrollToContact} >Reach Us</button>
      </div>
    </div>
      <div className="c-container" ref={contactSectionRef}>
        <div className="contact-box">
          <div className="left">
            <iframe
              title="University of Ghana Night Market Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.4892442642076!2d-0.18828548880576063!3d5.642117232752793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b7f77fb7a2d%3A0x505035ee9dec84c9!2sNight%20Market%2C%20University%20of%20Ghana%2C%20Legon!5e0!3m2!1sen!2sgh!4v1720039812972!5m2!1sen!2sgh"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="right">
            <form action="">
              <h2>CONTACT US</h2>
              <label>Full Name</label>
              <input type="text" className="cu-field" placeholder="Your Name" />
              <label>Email</label>
              <input type="email" className="cu-field" placeholder="Your Email" />
              <label>Phone</label>
              <input type="text" className="cu-field" placeholder="Phone" />
              <label>Enter Message</label>
              <textarea placeholder="Message" className="cu-field" id="non-resizable-textarea" rows={6}></textarea>
              <button type="submit" className="btn">Send</button>
            </form>
          </div>
        </div>
      </div>
      <div className="CU-Section3"></div>
      <ScrollToTop />
    </div>
  );
}

export default Contact;
