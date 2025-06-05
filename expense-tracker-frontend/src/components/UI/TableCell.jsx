import React from 'react';
import { TableCell as MuiTableCell } from '@mui/material';

const TableCell = ({ children }) => {
  return <MuiTableCell>{children}</MuiTableCell>;
};

export default TableCell;