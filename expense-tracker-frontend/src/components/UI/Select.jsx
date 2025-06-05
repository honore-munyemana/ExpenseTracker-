import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

const Select = ({ label, options, value, onChange, ...props }) => {
  return (
    <MuiTextField
      select
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      SelectProps={{ native: true }}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </MuiTextField>
  );
};

export default Select;