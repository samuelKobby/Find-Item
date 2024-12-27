import React, { useState, useEffect } from 'react';
import '../Styles/Products.css';
import team2 from '../Images/profile.jpeg';

function Cocktails() {
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
    fetch('https://find-item.vercel.app/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Image URLs:', data.map(product => product.image));
        const productsArray = data
          .filter(product => product.category === 'Cocktail')
          .map(product => ({
            ...product,
            image: `https://find-item.vercel.app/uploads/${product.image}`
          }));
        setProducts(productsArray);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch products. Please try again later.');
      });
  }, []);

  return (
    <div>
      <div className="product-main">
        <div className="homepage" id='cocktail'>
          <div className="content">
            <h1 className="title">Browse Found <br />Student and Other ID Cards.</h1>
            <p className="description">
              Have you lost your ID card? Check our list of found cards <br />
              to see if yours has been recovered.
            </p>
            <button id='cta-button' className="cta-button"><a href="./booking">Get Some</a></button>
          </div>
        </div>

        <div className="product-head">
          <h1>Report Lost Card</h1>
          <p>
            Below is a list of student ID cards that have been recently found. If your card is listed, please contact us to retrieve it.
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
                <p>Price: ${product.price}</p>
                <p>{product.category}</p>
              </div>
            </div>
          ))}
        </div>
        {visibleProducts < products.length && (
          <button className="show-more-button" onClick={showMoreProducts}>
            View More
          </button>
        )}
      </div>
      <div className='reviews-container'>
        <h2 className='review-h2'>What People Are Saying</h2>
        <div className='main-review-section'>
          <div className='main-review-sub'>
            <div className='review-content'>
              <div className='review1'>
                <img src={team2} alt="Drinks" className='review-image'/>
                <h3>Jane Doe</h3>
                <p>Student, University</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“Thanks to this platform, I was able to recover my lost ID card quickly. Truly a lifesaver!”</p>
              </div>
            </div>
          </div>
          <div className='main-review-sub'>
            <div className='review-content'>
              <div className='review1'>
                <img src={team2} alt="Drinks" className='review-image'/>
                <h3>Sam John</h3>
                <p>Student, College</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“Efficient and reliable. This service helped me find my ID card after weeks of searching.”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cocktails;
