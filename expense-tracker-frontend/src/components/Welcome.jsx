import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.contentInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>$</span>
            <span className={styles.logoText}>ExpenseTracker</span>
          </div>
          
          <h1 className={styles.title}>Track Your Expenses</h1>
          <h2 className={styles.subtitle}>Control Your Future</h2>
          
          <p className={styles.description}>
            Join thousands of people who use Expense Tracker to gain financial clarity and reach their savings goals.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Track expenses in real-time</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Create custom budgets</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Visualize spending patterns</span>
            </div>
          </div>
          
          <div className={styles.buttons}>
            <button 
              onClick={() => navigate('/signup')} 
              className={styles.buttonPrimary}
            >
              Get Started
            </button>
            
            <button 
              onClick={() => navigate('/login')} 
              className={styles.buttonSecondary}
            >
              Sign In
            </button>
          </div>
          
          <p className={styles.quote}>
            "Financial freedom starts with tracking every penny."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;