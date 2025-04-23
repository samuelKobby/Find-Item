import React, { useState } from 'react';
import '../Styles/Events.css';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import gadgetsImage from '../Images/gadgets.jpg';
import accessoriesImage from '../Images/Accessories.jpg';
import booksImage from '../Images/Books.jpg';
import othersImage from '../Images/others.jpg';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config/api';

const Events = () => {
  const { darkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    locationFound: '',
    dropOffLocation: '',  
    dateFound: '',
    description: '',
    finderName: '',
    finderContact: '',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Please try again.';
        } else {
          const text = await response.text();
          errorMessage = 'Server error. Please try again later.';
          console.error('Server response:', text);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Report submitted successfully!',
        text: 'Thank you for helping return lost items.',
      });
      
      setFormData({
        itemName: '',
        locationFound: '',
        dropOffLocation: 'security_office',
        dateFound: '',
        description: '',
        finderName: '',
        finderContact: '',
        image: null
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`events-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="hero-section">
        <div className="hero-content">
          <h1>Report Found Items</h1>
          <p>Help us return lost items to their rightful owners by reporting items you've found.</p>
        </div>
      </div>

      <div className="report-form-section">
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="itemName">Item Name*</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationFound">Location Found*</label>
            <input
              type="text"
              id="locationFound"
              name="locationFound"
              value={formData.locationFound}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dropOffLocation">Drop-off Location*</label>
            <select
              id="dropOffLocation"
              name="dropOffLocation"
              value={formData.dropOffLocation}
              onChange={handleInputChange}
              required
            >
              <option value="security_office">Security Office</option>
              <option value="library">Library</option>
              <option value="info_desk">Information Desk</option>
              <option value="student_center">Student Center</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dateFound">Date Found*</label>
            <input
              type="date"
              id="dateFound"
              name="dateFound"
              value={formData.dateFound}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="finderName">Your Name*</label>
            <input
              type="text"
              id="finderName"
              name="finderName"
              value={formData.finderName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="finderContact">Your Contact*</label>
            <input
              type="text"
              id="finderContact"
              name="finderContact"
              value={formData.finderContact}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="file-input-button">
                <FontAwesomeIcon icon={faUpload} /> Choose Image
              </div>
            </div>
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Events;
