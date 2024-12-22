import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../Images/Logo.png';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo-container">
            <Link to="/home" className="logo-link" onClick={handleLinkClick}>
              <img src={logo} alt="Logo" className="logo" />
              <span className="logo-text">We Found It</span>
            </Link>
            <button className={`menu-button ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
              {menuOpen ? <span>&times;</span> : <span>&#9776;</span>}
            </button>
          </div>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li>
                <Link to="/home" className={location.pathname === "/home" ? 'active' : ''} onClick={handleLinkClick}>Home</Link>
              </li>
              <li>
                <div className="dropdown" onClick={toggleDropdown}>
                  <Link to="/products" className={location.pathname.startsWith("/products") ? 'active' : ''}>Items<span className="dropdown-arrow">&#9662;</span></Link>
                  {dropdownOpen && (
                    <ul className="dropdown-menu">
                      <li><Link to="./cocktails" onClick={handleLinkClick}>ID Cards</Link></li>
                      <li><Link to="./boba" onClick={handleLinkClick}>Accessories</Link></li>
                      <li><Link to="./mocktails" onClick={handleLinkClick}>Others</Link></li>
                    </ul>
                  )}
                </div>
              </li>
              <li><Link to="/booking" className={location.pathname === "/booking" ? 'active' : ''} onClick={handleLinkClick}>Book Item</Link></li>
              <li><Link to="/events" className={location.pathname === "/events" ? 'active' : ''} onClick={handleLinkClick}>Events & Gallery</Link></li>
              <li><Link to="/contact" className={location.pathname === "/contact" ? 'active' : ''} onClick={handleLinkClick}>Contact</Link></li>
              <li><Link to="/about" className={location.pathname === "/about" ? 'active' : ''} onClick={handleLinkClick}>About</Link></li>
              <li><Link to="/admin" className={location.pathname === "/admin" ? 'active' : ''} onClick={handleLinkClick}>Admin</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;


