import React from 'react';
import { Alert as MuiAlert, Snackbar } from '@mui/material';

const Alert = ({ open, onClose, severity = 'info', message }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert elevation={6} variant="filled" severity={severity} onClose={onClose}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
