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
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

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
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error!', error.message, 'error');
    }
  };

  // Add a separate function to fetch reports
  const fetchReports = async () => {
    console.log('Fetching reports independently...');
    try {
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
      
      const response = await fetch('https://find-item.vercel.app/api/reports', {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      
      console.log('Reports fetch status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reports data fetched independently:', data);
      
      if (Array.isArray(data)) {
        setReports(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // The API returns { success: true, count: X, data: [...] }
        console.log('Setting reports from data.data:', data.data);
        
        // Log image URLs for debugging
        data.data.forEach(report => {
          console.log(`Report ${report._id} image:`, report.image);
        });
        
        setReports(data.data);
      } else if (data && typeof data === 'object' && Array.isArray(data.reports)) {
        // Some APIs wrap the array in an object with 'reports' key
        setReports(data.reports);
      } else {
        console.error('Unexpected reports data format:', data);
        setReports([]);
      }
    } catch (error) {
      console.error('Error in fetchReports:', error);
      setReports([]);
    }
  };

  // Call fetchReports when the reports section is selected
  useEffect(() => {
    if (selectedSection === 'reports') {
      fetchReports();
    }
  }, [selectedSection]);

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

  const openImagePreview = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImageUrl(null);
  };

  const getImageUrl = (report) => {
    // Check for image field in different possible formats
    if (!report) return defaultproductImage;
    
    // Check for Base64 image data
    if (report.image && typeof report.image === 'string') {
      if (report.image.startsWith('data:image')) {
        return report.image;
      }
    }
    
    // Check for imageUrl field
    if (report.imageUrl && typeof report.imageUrl === 'string') {
      if (report.imageUrl.startsWith('data:image')) {
        return report.imageUrl;
      }
      if (report.imageUrl.startsWith('http')) {
        return report.imageUrl;
      }
      return `${API_BASE_URL}/api/uploads/${report.imageUrl}?t=${Date.now()}`;
    }
    
    // If no valid image found, return default
    return defaultproductImage;
  };

  const renderReports = () => {
    console.log('Rendering reports section. Reports data:', reports);
    
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
                <th>Image</th>
                <th>Item</th>
                <th>Location Found</th>
                <th>Date Found</th>
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
                    <td>
                      <img
                        src={getImageUrl(report)}
                        alt={report.itemName || report.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onClick={() => openImagePreview(getImageUrl(report))}
                        onError={(e) => {
                          e.target.src = defaultproductImage;
                        }}
                      />
                    </td>
                    <td>{report.itemName || report.name}</td>
                    <td>{report.locationFound || report.location}</td>
                    <td>{new Date(report.dateFound || report.date).toLocaleDateString()}</td>
                    <td>{report.finderName}</td>
                    <td>{report.finderContact}</td>
                    <td>{report.description}</td>
                    <td>
                      <select
                        className="status-select"
                        value={report.status || 'Pending'}
                        onChange={(e) => handleUpdateReportStatus(report._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-action-button delete"
                          onClick={() => handleDeleteReport(report._id)}
                          title="Delete Report"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                          className="admin-action-button add-to-products"
                          onClick={() => handleAddReportToProducts(report)}
                          title="Add to Items"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {previewImageUrl && (
          <div className="image-preview-modal">
            <button className="close-button" onClick={closeImagePreview}>&times;</button>
            <img src={previewImageUrl} alt="Image Preview" />
          </div>
        )}
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
                      <select
                        className="status-select"
                        value={booking.status || 'Pending'}
                        onChange={(e) => handleUpdateBookingStatus(booking._id || booking.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      Swal.fire('Success!', 'Booking status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating booking status:', error);
      Swal.fire('Error!', error.message, 'error');
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      setReports(prevReports =>
        prevReports.map(report =>
          report._id === reportId ? { ...report, status: newStatus } : report
        )
      );

      Swal.fire('Success!', 'Report status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating report status:', error);
      Swal.fire('Error!', error.message, 'error');
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

  const handleAddReportToProducts = (report) => {
    console.log('Converting report to product:', report);
    
    // Create a new product from the report data
    const newProductData = {
      name: report.itemName || report.name,
      description: report.description || '',
      category: 'Found Items', // Default category
      image: report.image || null
    };
    
    // Show confirmation dialog
    Swal.fire({
      title: 'Add to Items?',
      text: `Add "${newProductData.name}" to the items list?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add it',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          
          const token = getAuthToken();
          if (!token) {
            navigate('/login');
            return;
          }
          
          // Create form data for the new product
          const formData = new FormData();
          formData.append('name', newProductData.name);
          formData.append('description', newProductData.description);
          formData.append('category', newProductData.category);
          
          // If the report has an image, try to use it
          if (newProductData.image && typeof newProductData.image === 'string' && newProductData.image.startsWith('http')) {
            // If it's a URL, we need to fetch the image and convert it to a file
            try {
              const response = await fetch(newProductData.image);
              const blob = await response.blob();
              const file = new File([blob], 'reported-item.jpg', { type: 'image/jpeg' });
              formData.append('image', file);
            } catch (error) {
              console.error('Error fetching image:', error);
              // Continue without the image
            }
          } else if (newProductData.image instanceof File) {
            formData.append('image', newProductData.image);
          }
          
          // Send the request to create a new product
          const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!response.ok) {
            throw new Error('Failed to add item');
          }
          
          // Refresh the products list
          fetchData();
          
          // Show success message
          Swal.fire('Success!', 'Item added successfully', 'success');
          
          // Update the report status to "Processed"
          handleUpdateReportStatus(report._id, 'Processed');
          
        } catch (error) {
          console.error('Error adding item:', error);
          Swal.fire('Error!', error.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
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
      <style>
        {`
          .status-select {
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            font-size: 14px;
            cursor: pointer;
            transition: border-color 0.2s;
          }

          .status-select:hover {
            border-color: #4f46e5;
          }

          .status-select:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
          }

          /* Status colors */
          .status-select option[value="Pending"] {
            color: #f59e0b;
          }

          .status-select option[value="In Progress"],
          .status-select option[value="Confirmed"] {
            color: #3b82f6;
          }

          .status-select option[value="Resolved"],
          .status-select option[value="Completed"] {
            color: #10b981;
          }

          .status-select option[value="Closed"],
          .status-select option[value="Cancelled"] {
            color: #6b7280;
          }
        `}
      </style>
    </div>
  );
};

export default Admin;
