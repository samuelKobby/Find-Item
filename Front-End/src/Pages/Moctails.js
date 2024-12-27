import React, { useState, useEffect } from 'react';
import '../Styles/Products.css';
import team2 from '../Images/profile.jpeg';

function Mocktails() {
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
          .filter(product => product.category === 'Mocktail')
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
        <div className="homepage" id='mocktail'>
          <div className="content">
            <h1 className="title">Explore <br/>Other Found Items <br/>In The Library.</h1>
            <p className="description">
              Did you lose something? <br />Browse through the list of items <br />
              found on campus and reconnect <br />with your belongings.
            </p>
            <button id='cta-button' className="cta-button"><a href="./booking">Book for Collection</a></button>
          </div>
        </div>

        <div className="product-head">
          <h1>Recently Found Items</h1>
          <p>
            Explore a collection of items <br />recently reported as found by students <br />and staff In the Library.
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
                <h3>Stacy Anas</h3>
                <p>Student, IT Faculty</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“I found my missing notebook here! This service is a lifesaver for lost items on campus.”</p>
              </div>
            </div>
          </div>
          <div className='main-review-sub'>
            <div className='review-content'>
              <div className='review1'>
                <img src={team2} alt="Drinks" className='review-image'/>
                <h3>John Smith</h3>
                <p>Faculty, Science Department</p>
              </div>
              <div className='review2'>
                <p className='stars'>⭐⭐⭐⭐⭐</p>
                <p className='review-text'>“The platform helped me reunite a student with their lost ID. Amazing initiative!”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mocktails;
