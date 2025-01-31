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
    imagePreview: ''
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [error, setError] = useState('');

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
      console.log('Fetched products:', productsData);

      const productsWithImages = productsData.map(product => ({
        ...product,
        image: product.image ? (
          product.image.startsWith('data:image') ? 
            product.image : 
            product.image.startsWith('http') ? 
              product.image : 
              `${API_BASE_URL}/api/uploads/${product.image}?t=${Date.now()}`
        ) : null
      }));

      console.log('Products with images:', productsWithImages);
      setProducts(productsWithImages);

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
      imagePreview: null, // Reset imagePreview when starting to edit
      image: product.image // Keep the current image URL
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

      const response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: formData
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to update product');
        } catch (e) {
          throw new Error('Failed to update product: ' + responseText);
        }
      }

      let updatedProduct;
      try {
        updatedProduct = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      // Update the product in the state with the correct image URL
      const productWithImage = {
        ...updatedProduct,
        image: editingProduct.imagePreview || (updatedProduct.image ? (
          updatedProduct.image.startsWith('data:image') ? 
            updatedProduct.image : 
            updatedProduct.image.startsWith('http') ? 
              updatedProduct.image : 
              `${API_BASE_URL}/api/uploads/${updatedProduct.image}?t=${Date.now()}`
        ) : null)
      };

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === editingProduct._id ? productWithImage : product
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
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: formData,
      });

      const responseText = await response.text();
      console.log('Server response text:', responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to add product');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);

      setProducts(prevProducts => [...prevProducts, data]);
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
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
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

  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('category', editingProduct.category);
      
      // Only append image if a new one was selected
      if (editingProduct.image instanceof File) {
        formData.append('image', editingProduct.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: formData
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to update product');
        } catch (e) {
          throw new Error('Failed to update product: ' + responseText);
        }
      }

      let updatedProduct;
      try {
        updatedProduct = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      // Update the product in the state with the correct image URL
      const productWithImage = {
        ...updatedProduct,
        image: updatedProduct.image ? (
          updatedProduct.image.startsWith('http') ? 
            updatedProduct.image : 
            `${API_BASE_URL}/api/uploads/${updatedProduct.image}?t=${Date.now()}`
        ) : null
      };

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === editingProduct._id ? productWithImage : product
        )
      );
      
      setEditingProduct(null);
      Swal.fire('Success!', 'Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire('Error!', error.message || 'Failed to update product', 'error');
    }
  };

  const handleImageChange = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isEditing) {
            setEditingProduct({
              ...editingProduct,
              image: file,
              imagePreview: reader.result
            });
          } else {
            setNewProduct({
              ...newProduct,
              image: file,
              imagePreview: reader.result
            });
          }
        };
        reader.readAsDataURL(file);
      } else {
        Swal.fire('Error!', 'Please upload an image file', 'error');
        e.target.value = '';
      }
    }
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
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewProduct({
                        ...newProduct,
                        image: file,
                        imagePreview: reader.result
                      });
                    };
                    reader.readAsDataURL(file);
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
              <img 
                src={newProduct.imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '200px', height: 'auto' }}
                onError={(e) => {
                  console.error('Preview image load error');
                  e.target.src = 'https://via.placeholder.com/150?text=Preview';
                }}
              />
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
              Change Image
            </div>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditingProduct({
                        ...editingProduct,
                        image: file,
                        imagePreview: reader.result
                      });
                    };
                    reader.readAsDataURL(file);
                  } else {
                    Swal.fire('Error!', 'Please upload an image file', 'error');
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
          <div className="image-preview">
            <img
              src={editingProduct.imagePreview || editingProduct.image || 'https://via.placeholder.com/150?text=No+Image'}
              alt="Preview"
              style={{ maxWidth: '200px', height: 'auto', objectFit: 'cover' }}
              onError={(e) => {
                console.error('Preview image load error');
                e.target.src = 'https://via.placeholder.com/150?text=Preview';
              }}
            />
          </div>
        </div>

        <button className="submit-button" onClick={handleSaveProduct}>
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="admin-products">
      <div className="admin-header">
        <div className="filter-and-search">
          <select
            value={filterCategory}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
         
        </div>
        <button className="add-product-button" onClick={() => setShowAddProductForm(true)}>
          <FaPlus /> Add Item
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={product.image || '/placeholder-image.png'}
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image load error for:', product.name);
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                
                />
              </div>
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>Category: {product.category}</p>
              </div>
            <div className="product-actions">
              <button onClick={() => handleEditProduct(product)} className="edit-button">
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button onClick={() => handleDeleteProduct(product._id)} className="delete-button">
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div id="admin-main-container">
      <div id="admin-sidebar">
        {/* <div id="logo" >
          <img src={/Images/Logo.png} alt="Logo" className="logo" />
        </div> */}
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('dashboard')}>Dashboard</div>
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('bookings')}>Bookings</div>
        <div className="admin-sidebar-item" onClick={() => setSelectedSection('previewProducts')}>Preview items</div>
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
        <h3>Items Reported</h3>
        <p>18</p>
        <small>5 Recovered</small>
      </div>
      <div className="dashboard-card">
        <h3>Active Search Requests</h3>
        <p>15</p>
        <small>3 Pending</small>
      </div>
      <div className="dashboard-card">
        <h3>Weekly Reports</h3>
        <p>4</p>
        <small>1 Found</small>
      </div>
      <div className="dashboard-card">
        <h3>System Engagement</h3>
        <p>80%</p>
        <small>20% Pending</small>
      </div>
    </div>
    <div className="active-projects">
      <h3>Active Search Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Request ID</th>
            <th>Status</th>
            <th>Item Image</th>
            <th>Recovery Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lost Wallet</td>
            <td>#2389</td>
            <td>Recovered</td>
            <td><img src="https://images.unsplash.com/photo-1593692247595-dc1459e50f35" alt="lost wallet" className="team-avatar" /></td>
            <td>100%</td>
          </tr>
          <tr>
            <td>Missing Laptop</td>
            <td>#2401</td>
            <td>Pending</td>
            <td><img src="https://images.unsplash.com/photo-1585858224017-635b221234f7" alt="lost laptop" className="team-avatar" /></td>
            <td>50%</td>
          </tr>
          <tr>
            <td>Found Phone</td>
            <td>#2412</td>
            <td>Recovered</td>
            <td><img src="https://images.unsplash.com/photo-1522748962058-d0241b01d56c" alt="found phone" className="team-avatar" /></td>
            <td>100%</td>
          </tr>
          <tr>
            <td>Lost Jacket</td>
            <td>#2447</td>
            <td>Pending</td>
            <td><img src="https://images.unsplash.com/photo-1565736607-df10a8ed5050" alt="lost jacket" className="team-avatar" /></td>
            <td>20%</td>
          </tr>
          <tr>
            <td>Found Backpack</td>
            <td>#2489</td>
            <td>Recovered</td>
            <td><img src="https://images.unsplash.com/photo-1586000073907-8f389d522c7e" alt="found backpack" className="team-avatar" /></td>
            <td>100%</td>
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
                          <option value="Accepted">Claimed</option>
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
          renderProducts()
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
