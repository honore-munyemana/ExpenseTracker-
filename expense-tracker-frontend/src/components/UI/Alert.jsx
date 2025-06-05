import React from 'react';
import { Alert as MuiAlert, Snackbar } from '@mui/material';

const Alert = ({ open, onClose, severity, message }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <MuiAlert elevation={6} variant="filled" onClose={onClose} severity={severity}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;