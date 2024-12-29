import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import '../Styles/typography.css';
import defaultproductImage from '../Images/bo4.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSignOutAlt, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL, UPLOADS_URL } from '../config/api';
import { getAuthToken, logout } from '../utils/auth';

const Admin = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const fileInputRef = useRef(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    image: null,
    imagePreview: null
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const categories = ['ID Card', 'Accessory', 'Others']

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`, { 
        headers,
        credentials: 'include'
      });
      if (!productsResponse.ok) {
        if (productsResponse.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch products');
      }
      const productsData = await productsResponse.json();
      setProducts(productsData.map(product => ({
        ...product,
        image: product.image ? (
          product.image.startsWith('http') ? 
            product.image : 
            `${API_BASE_URL}/api/uploads/${product.image}`
        ) : null
      })));

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings`, { 
        headers,
        credentials: 'include'
      });
      if (!bookingsResponse.ok) {
        if (bookingsResponse.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error!', error.message, 'error');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      imagePreview: product.image // The image is already a base64 string
    });
  };

  const handleSaveProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('category', editingProduct.category);
      
      // Only append image if a new one was selected
      if (editingProduct.image instanceof File) {
        formData.append('image', editingProduct.image);
      }

      // Make sure to use the correct endpoint
      const response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData,
      });

      const data = await response.text();
      console.log('Server response:', data);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(data);
          throw new Error(errorData.error || 'Failed to update product');
        } catch (e) {
          throw new Error('Failed to update product: ' + data);
        }
      }

      const updatedProduct = JSON.parse(data);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === editingProduct._id ? updatedProduct : product
        )
      );
      setEditingProduct(null);
      Swal.fire('Success!', 'Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire('Error!', error.message || 'Failed to update product', 'error');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.image) {
      Swal.fire('Error!', 'Please fill in all fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('image', newProduct.image);

    try {
      console.log('Sending data:', {
        name: newProduct.name,
        category: newProduct.category,
        image: newProduct.image.name
      });

      const response = await fetch(`${API_BASE_URL}/api/products/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      const responseText = await response.text();
      console.log('Server response text:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to add product');
      }

      const data = JSON.parse(responseText);
      setProducts([...products, data]);
      setShowAddProductForm(false);
      setNewProduct({ name: '', category: '', image: null, imagePreview: null });
      Swal.fire('Success!', 'Product added successfully', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      Swal.fire('Error!', error.message || 'Failed to add product', 'error');
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleUpdateImageClick = async () => {
    fileInputRef.current.click();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleDeleteBooking = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this booking!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
        setBookings(bookings.filter(booking => booking._id !== id));
        Swal.fire('Deleted!', 'The booking has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
  
    if (result.isConfirmed) {
      try {
        // Update the API endpoint (remove /delete from the URL)
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete product');
        }
  
        setProducts(products.filter(product => product._id !== productId));
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Error!', error.message || 'Failed to delete product', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProducts = products.filter(product => {
    return (
      (filterCategory === '' || product.category === filterCategory) &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const renderAddProductModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add New Item</h2>
          <button className="close-button" onClick={() => setShowAddProductForm(false)}>&times;</button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            className="form-input"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Enter item name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Image</label>
          <div className="file-input-wrapper">
            <div className="file-input-button">
              {newProduct.image ? 'Change Image' : 'Choose Image'}
            </div>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const imageUrl = await handleImageUpload(file);
                    setNewProduct({
                      ...newProduct,
                      image: file,
                      imagePreview: imageUrl
                    });
                  } else {
                    Swal.fire('Error!', 'Please upload an image file', 'error');
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
          {newProduct.imagePreview && (
            <div className="image-preview">
              <img src={newProduct.imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button className="submit-button" onClick={handleAddProduct}>
          Add Item
        </button>
      </div>
    </div>
  );

  const renderEditProductModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Item</h2>
          <button className="close-button" onClick={handleCloseModal}>&times;</button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            className="form-input"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            placeholder="Enter item name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={editingProduct.category}
            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Image</label>
          <div className="file-input-wrapper">
            <div className="file-input-button">
              {editingProduct.image ? 'Change Image' : 'Choose Image'}
            </div>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const imageUrl = await handleImageUpload(file);
                    setEditingProduct({
                      ...editingProduct,
                      image: file,
                      imagePreview: imageUrl
                    });
                  } else {
                    Swal.fire('Error!', 'Please upload an image file', 'error');
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
          {(editingProduct.imagePreview || editingProduct.image) && (
            <div className="image-preview">
              <img 
                src={editingProduct.imagePreview || `${UPLOADS_URL}/${editingProduct.image}`}
                alt="Preview"
              />
            </div>
          )}
        </div>

        <button className="submit-button" onClick={handleSaveProduct}>
          Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <div id="admin-main-container">
      <div id="admin-sidebar">
        <div id="logo" >
          <img src={defaultproductImage} alt="Logo" className="logo" />
        </div>
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('dashboard')}>Dashboard</div>
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('bookings')}>Bookings</div>
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('previewProducts')}>Preview Products</div>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          className="logout-icon"
          style={{ cursor: 'pointer', fontSize: '20px' }}
          onClick={handleLogout}
        />

      </div>
      <div id="admin-content">
        {selectedSection === 'dashboard' && (
          <div id="admin-dashboard-section">
            <h2>Dashboard</h2>
            <div className="dashboard-overview">
              <div className="dashboard-card">
                <h3>Monthly Orders</h3>
                <p>18</p>
                <small>2 Completed</small>
              </div>
              <div className="dashboard-card">
                <h3>Active Orders</h3>
                <p>15</p>
                <small>28 Completed</small>
              </div>
              <div className="dashboard-card">
                <h3>Weekly Orders</h3>
                <p>4</p>
                <small>1 Completed</small>
              </div>
              <div className="dashboard-card">
                <h3>Productivity</h3>
                <p>76%</p>
                <small>5% Completed</small>
              </div>
            </div>
            <div className="active-projects">
              <h3>Active Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Occasion Name</th>
                    <th>Hours</th>
                    <th>Priority</th>
                    <th>Sample Image</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Birthday Celebration</td>
                    <td>6</td>
                    <td>Medium</td>
                    <td><img src={defaultproductImage} alt="team" className="team-avatar" /></td>
                    <td>89%</td>
                  </tr>
                  <tr>
                    <td>Birthday Celebration</td>
                    <td>6</td>
                    <td>Medium</td>
                    <td><img src={defaultproductImage} alt="team" className="team-avatar" /></td>
                    <td>89%</td>
                  </tr>
                  <tr>
                    <td>Birthday Celebration</td>
                    <td>6</td>
                    <td>Medium</td>
                    <td><img src={defaultproductImage} alt="team" className="team-avatar" /></td>
                    <td>89%</td>
                  </tr>
                  <tr>
                    <td>Birthday Celebration</td>
                    <td>6</td>
                    <td>Medium</td>
                    <td><img src={defaultproductImage} alt="team" className="team-avatar" /></td>
                    <td>89%</td>
                  </tr>
                  <tr>
                    <td>Birthday Celebration</td>
                    <td>6</td>
                    <td>Medium</td>
                    <td><img src={defaultproductImage} alt="team" className="team-avatar" /></td>
                    <td>89%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedSection === 'bookings' && (
          <div id="admin-bookings-section">
            <h2>Bookings</h2>
            <table id="admin-bookings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.customerName}</td>
                    <td>{booking.contact1}</td>
                    <td>{booking.email}</td>
                    <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
                    <td>{booking.eventTime}</td>
                    <td>{booking.eventLocation}</td>
                    <td>{booking.eventDetails}</td>
                    <td>
                      <div className="custom-select-container">
                        <select
                          className="custom-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accept</option>
                          <option value="Denied">Deny</option>

                        </select>
                      </div>
                    </td>
                    <td>

                      <td>
                        <FontAwesomeIcon
                          icon={faTrash}
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="admin-delete-button"
                          style={{ cursor: 'pointer', fontSize: '20px', marginLeft: '10px' }}
                        />

                      </td>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedSection === 'previewProducts' && (
          <div id="admin-products-section">
            <div className='filter-and-search'>
              <select id="filtering" name='filterProduct' type="select" value={filterCategory} onChange={handleFilterChange}>
                <option value="">Filter</option>
                <option value="">All</option>
                <option value="ID Cards">ID Cards</option>
                <option value="Accessory">Accessories</option>
                <option value="Others">Others</option>
              </select>
              <input type='search' name='search' id='search' placeholder="Search" value={searchTerm} onChange={handleSearchChange} />
              <FaPlus className="plus-icon" onClick={() => setShowAddProductForm(true)} />
            </div>
            {filteredProducts.map(product => (
              <div className="admin-product-card" key={product.id}>
                <img src={product.image} alt={product.image} className="admin-product-image" />
                <div className="admin-product-details">
                  <h3>{product.name}</h3>
                  <p>Category: {product.category}</p>
                  

                </div>
                <div className="admin-product-actions">
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEditProduct(product)}
                    className="admin-edit-button"
                    style={{ cursor: 'pointer', fontSize: '20px' }}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => handleDeleteProduct(product._id)}
                    className="admin-delete-button"
                    style={{ cursor: 'pointer', fontSize: '20px', marginLeft: '10px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAddProductForm && renderAddProductModal()}
      {editingProduct && renderEditProductModal()}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </div>
  );
};

export default Admin;
