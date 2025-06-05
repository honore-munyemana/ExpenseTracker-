import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ children, color = 'primary', className = '', ...props }) => {
  const colorVariants = {
    primary: {
      backgroundColor: '#1976d2',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1565c0',
      }
    },
    secondary: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd',
      '&:hover': {
        backgroundColor: '#e0e0e0',
      }
    },
    success: {
      backgroundColor: '#4caf50',
      color: 'white',
      '&:hover': {
        backgroundColor: '#388e3c',
      }
    },
    danger: {
      backgroundColor: '#f44336',
      color: 'white',
      '&:hover': {
        backgroundColor: '#d32f2f',
      }
    }
  };

  return (
    <MuiButton 
      variant="contained" 
      sx={colorVariants[color]}
      className={className}
      disableElevation
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;