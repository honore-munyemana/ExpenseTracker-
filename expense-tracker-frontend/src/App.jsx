// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import CheckEmail from './components/CheckEmail.jsx'; // New component
import VerifyEmail from './components/VerifyEmail.jsx'; // New component
import Dashboard from './components/Dashboard.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import BudgetList from './components/BudgetList.jsx';
import Profile from './components/Profile.jsx';
import Reports from './components/Reports.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import Welcome from './components/Welcome.jsx';
import Manage from './components/Manage.jsx';
import SearchResults from './components/SearchResults.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/check-email" element={<CheckEmail />} /> {/* New route */}
          <Route path="/verify-email" element={<VerifyEmail />} /> {/* New route */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/budgets" element={<BudgetList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;