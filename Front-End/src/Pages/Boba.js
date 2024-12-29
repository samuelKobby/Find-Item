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
        const productsArray = data
          .filter(product => product.category === 'Others')
          .map(product => ({
            ...product,
            image: product.image ? (
              product.image.startsWith('http') ? 
                product.image : 
                `${API_BASE_URL}/api/uploads/${product.image}`
            ) : null
          }));
        setProducts(productsArray);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to load products');
      });
  }, []);

  return (
    <div className="products-container">
      <div className="product-head">
        <h1>Other Lost Items</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="products-grid">
        {products.slice(0, visibleProducts).map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img 
                src={product.image || '/default-image.jpg'} 
                alt={product.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-image.jpg';
                }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
            </div>
          </div>
        ))}
      </div>
      {visibleProducts < products.length && (
        <button onClick={showMoreProducts} className="load-more">
          View More Items
        </button>
      )}
      <ScrollToTop />
    </div>
  );
}

export default Boba;
