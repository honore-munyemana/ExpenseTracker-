// src/components/Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import styles from './Login.module.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebug('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sending login request with email:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, roles, verified } = response.data;
      
      setDebug(`Received token: ${token.substring(0, 20)}...`);
      
      if (!token || !token.includes('.')) {
        throw new Error('Invalid JWT token received');
      }
      
      localStorage.setItem('temp_token', token);
      localStorage.setItem('temp_roles', JSON.stringify(roles));
      localStorage.setItem('userEmail', email);
      
      setShowOtp(true);
      setError('');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data || error.message;
      setError(errorMsg === 'Please verify your email before logging in.' 
        ? 'Please verify your email before logging in. Check your inbox for the verification link.' 
        : `Login failed: ${errorMsg}`);
      setDebug(`Error details: ${JSON.stringify(error.response || error.message)}`);
      localStorage.removeItem('temp_token');
      localStorage.removeItem('temp_roles');
      localStorage.removeItem('userEmail');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebug('');
    
    const storedEmail = localStorage.getItem('userEmail') || email;
    
    try {
      console.log('Sending OTP verification', { email: storedEmail, otp });
      
      const response = await axios.post('/api/auth/verify-otp', { 
        email: storedEmail,
        otp: otp 
      });
      
      console.log('OTP verification response:', response.data);
      setDebug(`OTP verification successful. Response: ${JSON.stringify(response.data)}`);
      
      const { token, roles, verified } = response.data;
      
      if (!verified) {
        throw new Error('OTP verification failed - not verified');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('roles', JSON.stringify(roles));
      
      localStorage.removeItem('temp_token');
      localStorage.removeItem('temp_roles');
      localStorage.removeItem('userEmail');
      
      login();
      
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMsg = error.response?.data || error.message;
      setError(`OTP verification failed: ${errorMsg}`);
      setDebug(`Error details: ${JSON.stringify(error.response || error.message)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setDebug('');
    
    const storedEmail = localStorage.getItem('userEmail') || email;
    
    try {
      console.log('Resending OTP to:', storedEmail);
      const token = localStorage.getItem('temp_token');
      
      await axios.post('/api/auth/send-otp', 
        { email: storedEmail },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setError('New OTP sent to your email');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      const errorMsg = error.response?.data || error.message;
      setError(`Failed to resend OTP: ${errorMsg}`);
      setDebug(`Error details: ${JSON.stringify(error.response || error.message)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>$</span>
          <span className={styles.logoText}>ExpenseTracker</span>
        </div>
        
        <h2 className={styles.title}>
          {!showOtp ? 'Sign In to Your Account' : 'Verify Your Identity'}
        </h2>
        
        {error && (
          <div className={styles.error}>
            {error}
            {error.includes('Please verify your email') && (
              <div>
                <Link to="/signup" className={styles.link}>Resend verification email</Link>
              </div>
            )}
          </div>
        )}
        
        {debug && (
          <div className={styles.info}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{debug}</pre>
          </div>
        )}
        
        {!showOtp ? (
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password" 
                className={styles.input}
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.buttons}>
              <button 
                type="submit" 
                className={styles.buttonPrimary}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification}>
            <div className={styles.otpInfo}>
              <p>We've sent a verification code to:</p>
              <p className={styles.otpEmail}>{localStorage.getItem('userEmail') || email}</p>
              <p className={styles.otpHelp}>Enter the code below to continue</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                className={styles.input}
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                required
              />
            </div>
            
            <div className={styles.buttons}>
              <button 
                type="submit" 
                className={styles.buttonPrimary}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <button 
                type="button" 
                className={styles.buttonSecondary}
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
        
        <div className={styles.links}>
          <Link to="/signup" className={styles.link}>Need an account? Sign Up</Link>
          <span>|</span>
          <Link to="/reset-password" className={styles.link}>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;