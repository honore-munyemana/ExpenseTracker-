import React from 'react';
import { TableHead as MuiTableHead } from '@mui/material';

const TableHead = ({ children }) => {
  return <MuiTableHead>{children}</MuiTableHead>;
};

export default TableHead;