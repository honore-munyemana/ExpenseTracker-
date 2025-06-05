import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { BudgetProvider } from './context/BudgetContext.jsx';
import { ExpenseProvider } from './context/ExpenseContext.jsx';
import axios from 'axios';
import config from './config.js';

// Configure Axios defaults
axios.defaults.baseURL = config.API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BudgetProvider>
        <ExpenseProvider>
          <App />
        </ExpenseProvider>
      </BudgetProvider>
    </AuthProvider>
  </React.StrictMode>
);