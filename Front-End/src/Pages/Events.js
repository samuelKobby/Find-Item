import React, { useState } from 'react';
import '../Styles/Events.css';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faCamera } from '@fortawesome/free-solid-svg-icons';
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
      // Convert form data to JSON, handling the image separately
      const reportData = { ...formData };
      delete reportData.image; // Remove image from JSON data

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(reportData)
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
    <div className={`report-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="report-header" style={{
        backgroundImage: `url(${gadgetsImage})`
      }}>
        <div className="content">
          <h1>Report Found Items</h1>
          <p className="description">
            Help reunite lost items with their owners.<br />
            Fill out the form below to report an item you've found on campus.
          </p>
        </div>
      </div>

      <div className="report-form-section">
        <h2 style={{ marginBottom: '24px', color: darkMode ? '#e5e7eb' : '#374151', fontSize: '1.5rem', fontWeight: '600' }}>
          Item Information
        </h2>
        
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
              placeholder="What item did you find?"
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="form-group">
              <label htmlFor="locationFound">Where did you find it?*</label>
              <input
                type="text"
                id="locationFound"
                name="locationFound"
                value={formData.locationFound}
                onChange={handleInputChange}
                required
                placeholder="Where did you find the item?"
                disabled={isSubmitting}
              />
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dropOffLocation">Where did/will you leave the item?*</label>
            <select
              id="dropOffLocation"
              name="dropOffLocation"
              value={formData.dropOffLocation}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select a drop-off location</option>
              <option value="security_office">Main Entrance Security Post</option>
              <option value="library">Balme Library Security Post</option>
              <option value="info_desk">Business School Security Post (Ground Floor)</option>
              <option value="student_center">SRC Office</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Please provide detailed description of the item..."
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '12px' }}>
            <div className="form-group">
              <label htmlFor="finderName">Your Name*</label>
              <input
                type="text"
                id="finderName"
                name="finderName"
                value={formData.finderName}
                onChange={handleInputChange}
                required
                placeholder="Your full name"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="finderContact">Contact *</label>
              <input
                type="text"
                id="finderContact"
                name="finderContact"
                value={formData.finderContact}
                onChange={handleInputChange}
                required
                placeholder="Your email or phone number"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="image-input"
                disabled={isSubmitting}
              />
              <label htmlFor="image" className="image-upload-label">
                <FontAwesomeIcon icon={faCamera} />
                <span>Choose Image</span>
              </label>
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Submitting...</span>
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
