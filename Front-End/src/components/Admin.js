import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import '../Styles/typography.css';
import defaultproductImage from '../Images/bo4.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faSignOutAlt, 
  faArrowUp, 
  faTachometerAlt, 
  faBoxes, 
  faCalendarAlt, 
  faExclamationTriangle, 
  faUsers, 
  faChartBar, 
  faClock,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL, UPLOADS_URL } from '../config/api';
import { getAuthToken, logout } from '../utils/auth';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Pie, Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  ChartDataLabels
);

const Admin = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]); // Ensure reports is always an array
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    image: null
  });
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Chart data preparation functions
  const prepareCategoryChartData = () => {
    const categories = {};
    
    // Count products by category
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    // Prepare data for chart
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(217, 70, 239, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(244, 114, 182, 0.8)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(217, 70, 239, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(244, 114, 182, 1)'
          ],
          borderWidth: 1,
          hoverOffset: 15
        }
      ]
    };
  };

  const prepareBookingTrendsData = () => {
    // Create a map of the last 6 months
    const last6Months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6Months.push({
        month: month.getMonth(),
        year: month.getFullYear(),
        label: `${monthNames[month.getMonth()]} ${month.getFullYear()}`,
        count: 0
      });
    }
    
    // Count bookings by month
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const bookingMonth = bookingDate.getMonth();
      const bookingYear = bookingDate.getFullYear();
      
      const monthIndex = last6Months.findIndex(m => m.month === bookingMonth && m.year === bookingYear);
      if (monthIndex !== -1) {
        last6Months[monthIndex].count++;
      }
    });
    
    return {
      labels: last6Months.map(m => m.label),
      datasets: [
        {
          label: 'Bookings',
          data: last6Months.map(m => m.count),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  const prepareReportStatusData = () => {
    const statuses = {
      'Pending': 0,
      'In Progress': 0,
      'Resolved': 0,
      'Closed': 0
    };
    
    // Count reports by status
    if (Array.isArray(reports)) {
      reports.forEach(report => {
        const status = report.status || 'Pending';
        if (statuses.hasOwnProperty(status)) {
          statuses[status]++;
        } else {
          statuses['Pending']++;
        }
      });
    }
    
    return {
      labels: Object.keys(statuses),
      datasets: [
        {
          data: Object.values(statuses),
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ],
          borderColor: [
            'rgba(245, 158, 11, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(107, 114, 128, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
          },
          padding: 20
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, ctx) => {
          if (value === 0) return '';
          const total = ctx.dataset.data.reduce((acc, data) => acc + data, 0);
          const percentage = (value * 100 / total).toFixed(1) + '%';
          return percentage;
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  const categories = ['ID Card', 'Accessory', 'Others']

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
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
      'Accept': 'application/json',
      'Origin': window.location.origin
    };

    try {
      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`, { 
        headers,
        credentials: 'include',
        mode: 'cors'
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

      setProducts(productsWithImages);

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings`, { 
        headers,
        credentials: 'include',
        mode: 'cors'
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

      // Fetch reports
      const reportsResponse = await fetch(`https://find-item.vercel.app/api/reports`, {
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      if (!reportsResponse.ok) {
        if (reportsResponse.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch reports');
      }
      const reportsData = await reportsResponse.json();
      setReports(reportsData);

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

  const renderProducts = () => {
    return (
      <>
        <div id="admin-header">
          <h1 id="admin-title">Items Management</h1>
          
          <button className="admin-logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="admin-logout-icon" />
            Logout
          </button>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FontAwesomeIcon icon={faBoxes} className="admin-card-title-icon" />
              Items Management
            </h2>
            <button className="admin-add-button" onClick={() => setShowAddProductForm(true)}>
              <FaPlus className="admin-add-icon" />
              Add New Item
            </button>
          </div>

          <div className="admin-search-filter">
            <input
              type="text"
              placeholder="Search items..."
              className="admin-search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <select
              className="admin-filter-select"
              value={filterCategory}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image || defaultproductImage}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.target.src = defaultproductImage;
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-action-button edit"
                          onClick={() => handleEditProduct(product)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="admin-action-button delete"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderReports = () => {
    return (
      <>
        <div id="admin-header">
          <h1 id="admin-title">Reports Management</h1>
          
          <button className="admin-logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="admin-logout-icon" />
            Logout
          </button>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FontAwesomeIcon icon={faExclamationTriangle} className="admin-card-title-icon" />
              Reports Management
            </h2>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Reporter</th>
                <th>Contact</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(reports) && reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.itemName}</td>
                    <td>{report.reporterName}</td>
                    <td>{report.contactInfo}</td>
                    <td>{report.description}</td>
                    <td>
                      <div className={`status-badge ${report.status?.toLowerCase() || 'pending'}`}>
                        {report.status || 'Pending'}
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <select
                          value={report.status || 'Pending'}
                          onChange={(e) => handleUpdateReportStatus(report._id, e.target.value)}
                          className="admin-filter-select"
                          style={{ marginRight: '8px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          className="admin-action-button delete"
                          onClick={() => handleDeleteReport(report._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderBookings = () => {
    return (
      <>
        <div id="admin-header">
          <h1 id="admin-title">Bookings Management</h1>
          
          <button className="admin-logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="admin-logout-icon" />
            Logout
          </button>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="admin-card-title-icon" />
              Bookings Management
            </h2>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <tr key={booking._id || booking.id}>
                    <td>{booking.customerName}</td>
                    <td>{booking.contact1}</td>
                    <td>{booking.email}</td>
                    <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
                    <td>{booking.eventTime}</td>
                    <td>{booking.eventLocation}</td>
                    <td>
                      <div className="status-badge pending">
                        Pending
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-action-button delete"
                          onClick={() => handleDeleteBooking(booking._id || booking.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      // Update the reports state with the new status
      setReports(prevReports =>
        prevReports.map(report =>
          report._id === reportId ? { ...report, status: newStatus } : report
        )
      );

      Swal.fire('Success!', 'Report status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating report status:', error);
      Swal.fire('Error!', error.message || 'Failed to update report status', 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this report!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to delete report');
        }

        setReports(reports.filter(report => report._id !== reportId));
        Swal.fire('Deleted!', 'The report has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting report:', error);
        Swal.fire('Error!', error.message || 'Failed to delete report', 'error');
      }
    }
  };

  const renderDashboard = () => {
    return (
      <>
        <div id="admin-header">
          <h1 id="admin-title">Dashboard</h1>
          
          <button className="admin-logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="admin-logout-icon" />
            Logout
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon primary">
              <FontAwesomeIcon icon={faBoxes} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Total Items</div>
              <div className="admin-stat-value">{products.length}</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-icon success">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Bookings</div>
              <div className="admin-stat-value">{bookings.length}</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-icon warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Pending Reports</div>
              <div className="admin-stat-value">
                {Array.isArray(reports) ? reports.filter(report => report.status === 'Pending').length : 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-dashboard-charts">
          <div className="admin-chart-container">
            <h3 className="admin-chart-title">
              <FontAwesomeIcon icon={faChartBar} className="admin-chart-icon" />
              Items by Category
            </h3>
            <div className="admin-chart">
              <Doughnut 
                data={prepareCategoryChartData()} 
                options={chartOptions}
              />
            </div>
          </div>
          
          <div className="admin-chart-container">
            <h3 className="admin-chart-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="admin-chart-icon" />
              Booking Trends
            </h3>
            <div className="admin-chart">
              <Line 
                data={prepareBookingTrendsData()} 
                options={lineChartOptions}
              />
            </div>
          </div>
          
          <div className="admin-chart-container">
            <h3 className="admin-chart-title">
              <FontAwesomeIcon icon={faExclamationTriangle} className="admin-chart-icon" />
              Report Status
            </h3>
            <div className="admin-chart">
              <PolarArea 
                data={prepareReportStatusData()} 
                options={chartOptions}
              />
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FontAwesomeIcon icon={faExclamationTriangle} className="admin-card-title-icon" />
              System Alerts
            </h2>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#F59E0B', marginRight: '0.75rem', marginTop: '0.25rem' }} />
              <div>
                <h3 style={{ fontWeight: '500', color: '#92400E', marginBottom: '0.25rem' }}>New Reports</h3>
                <p style={{ color: '#92400E' }}>You have {Array.isArray(reports) ? reports.filter(report => report.status === 'Pending').length : 0} pending reports to review</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FontAwesomeIcon icon={faBoxes} className="admin-card-title-icon" />
              Recently Added Items
            </h2>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.image || defaultproductImage}
                      alt={product.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.src = defaultproductImage;
                      }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-action-button edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="admin-action-button delete"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div id="admin-main-container">
      <div id="admin-sidebar">
        <div id="admin-sidebar-logo">Find Items Admin</div>
        
        <div 
          className={`admin-sidebar-item ${selectedSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setSelectedSection('dashboard')}
        >
          <FontAwesomeIcon icon={faTachometerAlt} className="admin-sidebar-item-icon" />
          Dashboard
        </div>
        
        <div 
          className={`admin-sidebar-item ${selectedSection === 'previewProducts' ? 'active' : ''}`}
          onClick={() => setSelectedSection('previewProducts')}
        >
          <FontAwesomeIcon icon={faBoxes} className="admin-sidebar-item-icon" />
          Items
        </div>
        
        <div 
          className={`admin-sidebar-item ${selectedSection === 'bookings' ? 'active' : ''}`}
          onClick={() => setSelectedSection('bookings')}
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="admin-sidebar-item-icon" />
          Bookings
        </div>
        
        <div 
          className={`admin-sidebar-item ${selectedSection === 'reports' ? 'active' : ''}`}
          onClick={() => setSelectedSection('reports')}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="admin-sidebar-item-icon" />
          Reports
        </div>
        
        <div className="admin-sidebar-item" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="admin-sidebar-item-icon" />
          Logout
        </div>
      </div>
      
      <div id="admin-content">
        {selectedSection === 'dashboard' && renderDashboard()}
        {selectedSection === 'reports' && renderReports()}
        {selectedSection === 'bookings' && renderBookings()}
        {selectedSection === 'previewProducts' && renderProducts()}
      </div>
      {showAddProductForm && renderAddProductModal()}
      {editingProduct && renderEditProductModal()}
      <button 
        className={`scroll-to-top ${showScrollToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </div>
  );
};

export default Admin;
