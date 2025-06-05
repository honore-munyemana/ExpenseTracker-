// src/components/Signup.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Signup.module.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (passwordError) {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      setPasswordError('Password must contain at least one letter and one number');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    setError('');
    setPasswordError('');
    setSuccess('');
    setLoading(true);
    
    if (!validatePasswords()) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        name,
        email,
        password,
      });
      
      setSuccess('Account created! Please check your email to verify your account.');
      setTimeout(() => navigate('/check-email'), 2000);
    } catch (error) {
      console.error('Signup failed', error.response ? error.response.data : error.message);
      if (error.response?.status === 409) {
        setError('An account with this email already exists');
      } else if (error.response?.data) {
        setError(error.response.data);
      } else {
        setError('Signup failed. Please try again.');
      }
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
        
        <h2 className={styles.title}>Create Your Account</h2>
        
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}
        
        <form onSubmit={handleSignup}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={8}
            />
            <small className={styles.inputHint}>
              Must be at least 8 characters with numbers and letters
            </small>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              className={styles.input}
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (
              <div className={styles.fieldError}>{passwordError}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className={styles.links}>
          Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;