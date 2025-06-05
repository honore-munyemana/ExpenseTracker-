import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

const Input = ({ label, ...props }) => {
  return <MuiTextField label={label} fullWidth margin="normal" {...props} />;
};

export default Input;