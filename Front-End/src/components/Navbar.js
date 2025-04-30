import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logo from '../Images/Logo.png';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

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
                {/* <Link to="/home" className={location.pathname === "/home" ? 'active' : ''} onClick={handleLinkClick}>Home</Link> */}
              </li>
              <li>
                <div className="dropdown" onClick={toggleDropdown}>
                  <Link to="/products" className={location.pathname.startsWith("/products") ? 'active' : ''}>Items<span className="dropdown-arrow">&#9662;</span></Link>
                  {dropdownOpen && (
                    <ul className="dropdown-menu">
                      <li><Link to="./cocktails" onClick={handleLinkClick}>ID Cards</Link></li>
                      <li><Link to="./mocktails" onClick={handleLinkClick}>Accessories</Link></li>
                      <li><Link to="./boba" onClick={handleLinkClick}>Others</Link></li>
                    </ul>
                  )}
                </div>
              </li>
              <li><Link to="/booking" className={location.pathname === "/booking" ? 'active' : ''} onClick={handleLinkClick}>Book Item</Link></li>
              <li><Link to="/events" className={location.pathname === "/events" ? 'active' : ''} onClick={handleLinkClick}>Report Item</Link></li>
              <li><Link to="/contact" className={location.pathname === "/contact" ? 'active' : ''} onClick={handleLinkClick}>Contact</Link></li>
              <li><Link to="/about" className={location.pathname === "/about" ? 'active' : ''} onClick={handleLinkClick}>About</Link></li>
              <li><Link to="/admin" className={location.pathname === "/admin" ? 'active' : ''} onClick={handleLinkClick}>Admin</Link></li>
              <li>
                <button 
                  onClick={toggleDarkMode} 
                  className="theme-toggle"
                  aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
