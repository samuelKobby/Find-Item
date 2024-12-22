import React, { useState, useEffect } from 'react';
import '../Styles/Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(3);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth <= 1068) {
      setVisibleProducts(3);
    } else if (windowWidth <= 1920) {
      setVisibleProducts(3);
    } else if (windowWidth <= 480) {
      setVisibleProducts(3);
    } else {
      setVisibleProducts(products.length);
    }
  }, [windowWidth, products.length]);

  const showMoreProducts = () => {
    setVisibleProducts(prev => prev + 3);
  };

  useEffect(() => {
    fetch('http://localhost:4000/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Image URLs:', data.map(product => product.image));
        const baseURL = 'http://localhost:4000/uploads/';
        const productsArray = data.map(product => ({
          ...product,
          image: baseURL + product.image
        }));
        setProducts(productsArray);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch products. Please try again later.');
      });
  }, []);

  return (
    <div className="product-main">
      <div className="homepage" id='products'>
        <div className="content">
          <h1 className="title">Find Your <br />Missing Belongings</h1>
          <p className="description">
            Lost something on campus? <br />Discover our reliable platform to help you<br /> 
            track and reconnect with your items.<br />Find it, claim it, and move on.
          </p>
          <a href="./booking"><button id='cta-button' className="cta-button">Start Searching</button></a>
        </div>
      </div>

      <div className="product-head">
        <h1>Items Recently Reported</h1>
        <p>
          From ID cards to personal belongings, <br />browse through items others have reported. <br />Your lost treasure might just be here.
        </p>
      </div>
      <div className="product-grid">
        {error && <p className="error">{error}</p>}
        {products.slice(0, visibleProducts).map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => { e.target.src = '/path/to/default-image.jpg'; }} // Replace with actual default image path
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Details: {product.price}</p> {/* Update this line to reflect item-specific details */}
            </div>
          </div>
        ))}
      </div>
      {visibleProducts < products.length && (
        <button className="show-more-button" onClick={showMoreProducts}>
          View More Items
        </button>
      )}
    </div>
  );
}

export default Products;
