import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      width: '100%',
      padding: '18px 0',
      textAlign: 'center',
      background: 'linear-gradient(90deg, #f5f7fa 0%, #e4edf7 100%)',
      color: '#6366f1',
      fontWeight: 500,
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 16,
      letterSpacing: 1,
      position: 'relative',
      bottom: 0,
      left: 0,
      zIndex: 10,
      boxShadow: '0 -2px 8px rgba(99,102,241,0.04)'
    }}>
      <span>© {new Date().getFullYear()} Expense Tracker</span>
    </footer>
  );
};

export default Footer;