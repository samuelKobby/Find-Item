import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Contact from './Pages/Contact';
import Events from './Pages/Events';
import About from './Pages/About';
import Products from './Pages/Products';
import Booking from './Pages/Booking';
import Admin from './components/Admin';
import Login from './components/Login';
import Boba from './Pages/Boba';
import Mocktails from './Pages/Moctails';
import Cocktails from './Pages/Cocktails';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    // Update auth state when localStorage changes
    const handleStorageChange = () => {
      setIsAuth(isAuthenticated());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Component to handle conditional footer rendering
  const AppContent = () => {
    const location = useLocation();
    const hideFooterPaths = ['/login', '/admin'];
    const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/boba" element={<Boba />} />
          <Route path="/mocktails" element={<Mocktails />} />
          <Route path="/cocktails" element={<Cocktails />} />
          <Route path="/booking" element={<Booking />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? (
                <Navigate to="/admin" />
              ) : (
                <Login setAuth={setIsAuth} />
              )
            }
          />
        </Routes>
        {shouldShowFooter && <Footer />}
      </>
    );
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
