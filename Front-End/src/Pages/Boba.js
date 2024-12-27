import React, { useState, useEffect } from 'react';
import '../Styles/Products.css';
import team2 from '../Images/profile.jpeg';

function Boba() {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(3);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [error, setError] = useState('');
  const defaultImage = '/path/to/default-image.jpg'; // Path to a default image

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
    fetch('https://find-item.vercel.app/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Image URLs:', data.map(product => product.image));
        const productsArray = data.filter(product => product.category === 'Accessories').map(product => ({
          ...product,
          image: `https://find-item.vercel.app/uploads/${product.image}`
        }));

        setProducts(productsArray);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch accessories. Please try again later.');
      });
  }, []);

  return (
    <div>
      <div className="product-main">
        <div className="homepage" id='boba'>
          <div className="content">
            <h1 className="title">Recently Found <br />Accessories</h1>
            <p className="description">
              Lost something valuable? <br />Browse through our collection of recently found <br />
              accessories to reconnect with your items. <br />We care about reuniting you with your belongings.
            </p>
            <button id='cta-button' className="cta-button"><a href="./booking">Find Yours</a></button>
          </div>
        </div>

        <div className="product-head">
          <h1>FOUND ACCESSORIES</h1>
          <p>
            Explore our catalog of accessories that have been reported as found. <br />From watches to wallets, your lost item might be here.
          </p>
        </div>
        <div className="product-grid">
          {error && <p className="error">{error}</p>}
          {products.slice(0, visibleProducts).map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={product.image || defaultImage} // Use default image if product image is not available
                  alt={product.name}
                  onError={(e) => { e.target.src = defaultImage; }} // Fallback to default image if error
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
            View More
          </button>
        )}
        <div className="cust-reviews"></div>
      </div>
      <div className='reviews-container'>
        <h2 className='review-h2'>What People Are Saying</h2>
        <div className='main-review-section'>
          <div className='main-review-sub'>
            <div className='review-content'>
              <div className='review1'>
                <img src={team2} alt="Accessories" className='review-image'/>
                <h3>Jane Doe</h3>
                <p>Student, Uni Campus</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“Thanks to this platform, I found my missing wallet within a day! Highly recommend it for everyone on campus.”</p>
              </div>
            </div>
          </div>
          <div className='main-review-sub'>
            <div className='review-content'>
              <div className='review1'>
                <img src={team2} alt="Accessories" className='review-image'/>
                <h3>John Smith</h3>
                <p>Professor, Faculty of Science</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“This service is a lifesaver! I misplaced my watch, and they made it easy to reclaim it. Truly a remarkable initiative.”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Boba;
