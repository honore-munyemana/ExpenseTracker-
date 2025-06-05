// src/components/CheckEmail.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Signup.module.css'; // Reuse Signup styles for consistency

const CheckEmail = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>$</span>
          <span className={styles.logoText}>ExpenseTracker</span>
        </div>
        
        <h2 className={styles.title}>Check Your Email</h2>
        
        <div className={`${styles.message} ${styles.success}`}>
          We've sent a verification link to your email. Please click the link to verify your account.
        </div>
        
        <div className={styles.links}>
          Didn't receive the email? <Link to="/signup" className={styles.link}>Try signing up again</Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;