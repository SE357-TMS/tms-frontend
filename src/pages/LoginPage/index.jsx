import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      console.log('🔵 Attempting login...', { username: formData.username });
      
      // Call login API with rememberMe flag
      const result = await authService.login(formData.username, formData.password, rememberMe);
      
      console.log('✅ Login successful!', result);
      console.log('🔑 Token saved:', authService.getToken());
      
      // Login successful, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setErrors({ submit: 'Invalid username or password' });
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-container">
          {/* Logo & Brand */}
          <div className="login-brand">
            <div className="brand-icon">
              <svg width="48" height="48" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="loginGlobeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6FC6A1" />
                    <stop offset="100%" stopColor="#4D40CA" />
                  </linearGradient>
                </defs>
                <path 
                  d="M1.68675 14.6451L3.59494 13.5435C3.6983 13.4839 3.8196 13.4631 3.9369 13.4851L7.6914 14.1878C7.99995 14.2455 8.28478 14.008 8.28338 13.6941L8.26876 10.4045C8.26836 10.3151 8.29193 10.2272 8.33701 10.15L10.2317 6.90621C10.3303 6.73739 10.3215 6.52658 10.2091 6.3666L7.01892 1.82568M18.0002 3.85905C12.5002 6.50004 15.5 10 16.5002 10.5C18.3773 11.4384 20.9876 11.5 20.9876 11.5C20.9958 11.3344 21 11.1677 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21C11.1677 21 11.3344 20.9959 11.5 20.9877M15.7578 20.9398L12.591 12.591L20.9398 15.7578L17.2376 17.2376L15.7578 20.9398Z" 
                  stroke="url(#loginGlobeGradient)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">Travel</span>
              <span className="brand-subtitle">Adventure</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="login-header">
            <h2>Welcome Back!</h2>
            <p>Please login to your account to continue</p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Input */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={errors.username ? 'input-error' : ''}
                autoComplete="username"
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="error-banner">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"/>
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="login-right">
        <div className="hero-content">
          <h2>Explore The World</h2>
          <p>Discover amazing destinations and create unforgettable memories</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Destinations</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Travelers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </div>
    </div>
  );
};

export default LoginPage;
