import React from 'react';
import { TableRow as MuiTableRow } from '@mui/material';

const TableRow = ({ children }) => {
  return <MuiTableRow>{children}</MuiTableRow>;
};

export default TableRow;