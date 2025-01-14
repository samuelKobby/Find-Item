import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/Products.css';
import '../Styles/ScrollToTop.css';
import ScrollToTop from '../components/ScrollToTop';

function Boba() {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(6);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth <= 768) {
      setVisibleProducts(3);
    } else if (windowWidth <= 1024) {
      setVisibleProducts(4);
    } else {
      setVisibleProducts(6);
    }
  }, [windowWidth]);

  const showMoreProducts = () => {
    setVisibleProducts(prev => prev + 3);
  };

  useEffect(() => {
    // Fetch products from the backend
    fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const productsArray = data.filter(product => product.category === 'Others');
        setProducts(productsArray);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to load products');
      });
  }, []);

  return (
    <div className="product-main">
      <div className="homepage" id='boba'>
        <div className="content">
          <h1 className="title">Other Lost Items</h1>
          <p className="description">
            Lost something else on campus? <br />Check here to see if someone has found it.
          </p>
        </div>
      </div>

      <div className="product-head">
        <h1>Recently Found Items</h1>
        <p>
          Browse through other items that have been found. <br />
          Your lost item might be here.
        </p>
      </div>
      <div className="product-grid1">
        {error && <p className="error">{error}</p>}
        {products.slice(0, visibleProducts).map((product, index) => (
          <div key={product._id || index} className="product-card1">
            <div className="product-image1">
              <img
                src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
                alt={product.name}
                onError={(e) => {
                  console.error('Image load error for:', product.name);
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Details: {product.price}</p>
            </div>
          </div>
        ))}
      </div>
      {visibleProducts < products.length && (
        <button onClick={showMoreProducts} className="load-more">
          Load More
        </button>
      )}
      <ScrollToTop />
    </div>
  );
}

export default Boba;
