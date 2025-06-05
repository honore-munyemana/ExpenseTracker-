// src/components/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styles from './Signup.module.css'; // Reuse Signup styles

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Invalid verification link.');
      setIsSuccess(false);
      return;
    }

    axios
      .get(`http://localhost:8080/api/auth/verify-email?token=${token}`)
      .then((response) => {
        setMessage(response.data);
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        setMessage(error.response?.data || 'Error verifying email.');
        setIsSuccess(false);
      });
  }, [searchParams, navigate]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>$</span>
          <span className={styles.logoText}>ExpenseTracker</span>
        </div>
        
        <h2 className={styles.title}>Email Verification</h2>
        
        <div className={`${styles.message} ${isSuccess ? styles.success : styles.error}`}>
          {message}
        </div>
        
        {isSuccess ? (
          <div className={styles.links}>
            Redirecting to login... <Link to="/login" className={styles.link}>Go to Login</Link>
          </div>
        ) : (
          <div className={styles.links}>
            Try again? <Link to="/signup" className={styles.link}>Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;