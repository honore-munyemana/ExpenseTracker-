import React from 'react';
import { Table as MuiTable } from '@mui/material';

const Table = ({ children }) => {
  return <MuiTable>{children}</MuiTable>;
};

export default Table;