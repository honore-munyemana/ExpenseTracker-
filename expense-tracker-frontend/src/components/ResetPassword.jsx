import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Verification Code, 3: New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle request password reset (Step 1)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending password reset request for email:', email);
      
      // Call the forgot-password endpoint to send OTP
      const response = await axios.post('/api/auth/forgot-password', 
        { email: email },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );
      
      console.log('Password reset response:', response);
      setSuccess(`Reset code sent to ${email}. Please check your inbox.`);
      setStep(2);
    } catch (error) {
      console.error('Reset request error details:', error);
      setError(error.response?.data || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission (Step 2)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // We don't verify the code separately - we'll verify when resetting the password
    // Just move to the next step if the code is filled
    if (verificationCode.length === 6) {
      setSuccess('Please enter your new password.');
      setStep(3);
    } else {
      setError('Please enter the 6-digit verification code.');
    }
    
    setLoading(false);
  };

  // Handle password reset (Step 3)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sending password reset with OTP', {
        email, 
        otp: verificationCode, 
        newPassword: '********', // Hide actual password in logs
        confirmPassword: '********'
      });
      
      // Call the reset-password-with-otp endpoint
      const response = await axios.post('/api/auth/reset-password-with-otp', 
        { 
          email, 
          otp: verificationCode, 
          newPassword,
          confirmPassword
        },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );
      
      console.log('Password reset successful:', response);
      setSuccess('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Password reset error details:', error);
      setError(error.response?.data || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle code input changes (for the 6-digit verification code)
  const handleCodeChange = (value) => {
    // Only allow numbers and limit to 6 characters
    const numericValue = value.replace(/[^0-9]/g, '').substring(0, 6);
    setVerificationCode(numericValue);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>$</span>
          <span className={styles.logoText}>ExpenseTracker</span>
        </div>
        
        <h2 className={styles.title}>
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Verify Your Email'}
          {step === 3 && 'Create New Password'}
        </h2>
        
        {step === 1 && (
          <p className={styles.subtitle}>
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        )}
        
        {/* Error and Success Messages */}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}
        
        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
            
            <div className={styles.links}>
              <Link to="/login" className={styles.link}>Back to Login</Link>
            </div>
          </form>
        )}
        
        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className={styles.section}>
              <p>We've sent a 6-digit verification code to:</p>
              <p><strong>{email}</strong></p>
              <p className={styles.subtitle}>Enter the code below to continue.</p>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode" className={styles.label}>Verification Code</label>
              <input
                id="verificationCode"
                type="text"
                className={styles.input}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                pattern="[0-9]{6}"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <button 
              type="button" 
              className={styles.buttonSecondary}
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </form>
        )}
        
        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>New Password</label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <button 
              type="button" 
              className={styles.buttonSecondary}
              onClick={() => setStep(2)}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;