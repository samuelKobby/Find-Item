import React, { useState, useRef, useEffect } from 'react';
import './Admin.css';
import defaultproductImage from '../Images/bo4.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../Images/Logo.png';


const Admin = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const fileInputRef = useRef(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: '' });

  const navigate = useNavigate();
   const token = localStorage.getItem('token');

  useEffect(() => {
  // Fetch products from the database including image data
  fetch('http://localhost:4000/api/products')
    .then(response => response.json())
    .then(data => {
      const productsWithImages = data.map(product => ({
        ...product,
        image: `http://localhost:4000/uploads/${product.image}` 
      }));
      setProducts(productsWithImages);
    })
    .catch(error => console.error('Error fetching products:', error));

  // Fetch bookings from the database
  fetch('http://localhost:4000/api/bookings')
    .then(response => response.json())
    .then(data => setBookings(data))
    .catch(error => console.error('Error fetching bookings:', error));
}, []);


  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

const handleSaveProduct = async () => {
  try {
    const formData = new FormData();

    // Append all fields from editingProduct to FormData
    for (const key in editingProduct) {
      if (Object.prototype.hasOwnProperty.call(editingProduct, key)) {
        formData.append(key, editingProduct[key]);
      }
    }

    // Send the update request
    const response = await fetch(`http://localhost:4000/api/products/update/${editingProduct._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (response.ok) {
      const updatedProduct = await response.json();
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product._id === editingProduct._id ? updatedProduct : product))
      );
      setEditingProduct(null);
      Swal.fire('Updated!', 'The product has been updated.', 'success');
    } else {
      const errorData = await response.json();
      Swal.fire('Error!', errorData.message || 'Failed to update the product.', 'error');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    Swal.fire('Error!', 'An unexpected error occurred.', 'error');
  }
};


 const handleAddProduct = () => {
  const formData = new FormData();
  formData.append('name', newProduct.name);
  formData.append('category', newProduct.category);
  formData.append('price', newProduct.price);
  formData.append('image', newProduct.image); // Adding the image file

  fetch('http://localhost:4000/api/products/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`  // Include the token for authentication
    },
    body: formData,  // Send the formData as the body of the request
  })
    .then(response => response.json())
    .then(data => {
      setProducts([...products, data]);  // Update the products list with the new product
      setShowAddProductForm(false);  // Close the add product form
    })
    .catch(error => console.error('Error adding product:', error));
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: file });  // Update the image for the product being edited
    } else {
      setNewProduct({ ...newProduct, image: file });  // Update the image for the new product
    }
  }
};


  const handleUpdateImageClick = () => {
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
        await fetch(`http://localhost:4000/api/bookings/${id}`, { method: 'DELETE' });
        setBookings(bookings.filter(booking => booking._id !== id));
        Swal.fire('Deleted!', 'The booking has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

const handleDeleteProduct = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this product!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:4000/api/products/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}` // Include the token in the request
          }
      });

      if (response.ok) {
        setProducts((prevProducts) => prevProducts.filter(product => product._id !== id));
        Swal.fire('Deleted!', 'The product has been deleted.', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('Error!', errorData.message || 'Failed to delete the product.', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire('Error!', 'An unexpected error occurred.', 'error');
    }
  }
};

  

const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout!'
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token');

      // Send the logout request to the backend
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token }) // Send the token to the backend
      });

      // Remove the token from localStorage
      localStorage.removeItem('token');

      // Redirect to login page or show success message
      window.location.href = '/login';
      Swal.fire('Logged out!', 'You have been logged out successfully.', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire('Error!', 'An error occurred while logging out.', 'error');
    }
  }
};




  const filteredProducts = products.filter(product => {
    return (
      (filterCategory === '' || product.category === filterCategory) &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div id="admin-main-container">
      <div id="admin-sidebar">
        <div id="logo" >
          <img src={logo} alt="Logo" className="logo" />
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
                <option value="Cocktail">Cocktail</option>
                <option value="Mocktail">Mocktail</option>
                <option value="Boba">Boba</option>
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
                  <p>Price: GH¢{product.price}</p>
                  
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
                        onClick={() => handleDeleteProduct(product._id, 'products')}
                        className="admin-delete-button"
                        style={{ cursor: 'pointer', fontSize: '20px', marginLeft: '10px' }}
                      />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editingProduct && (
        <div id="admin-modal">
          <div id="admin-modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="closing-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="edit-form">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              />
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              />
               <label htmlFor="image">Product Image</label>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button type="button" onClick={handleUpdateImageClick}>Update Image</button>
              <button type="button" onClick={handleSaveProduct}>Save</button>
            </div>
          </div>
        </div>
      )}
      {showAddProductForm && (
        <div id="admin-modal">
          <div id="admin-modal-content">
            <div className="modal-header">
              <h2>Add Product</h2>
              <button className="closing-button" onClick={() => setShowAddProductForm(false)}>×</button>
            </div>
            <div className="edit-form">
              <label htmlFor="newname">Product Name</label>
              <input
                type="text"
                id="newname"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <label htmlFor="newprice">Price</label>
              <input
                type="number"
                id="newprice"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <label htmlFor="newcategory">Category</label>
              <input
                type="text"
                id="newcategory"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
              <label htmlFor="newimage">Product Image</label>
              <input
                type="file"
                id="newimage"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button type="button" onClick={handleUpdateImageClick}>Upload Image</button>
              <button type="button" onClick={handleAddProduct}>Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
