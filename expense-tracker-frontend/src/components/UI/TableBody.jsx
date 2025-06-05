import React from 'react';
import { TableBody as MuiTableBody } from '@mui/material';

const TableBody = ({ children }) => {
  return <MuiTableBody>{children}</MuiTableBody>;
};

export default TableBody;