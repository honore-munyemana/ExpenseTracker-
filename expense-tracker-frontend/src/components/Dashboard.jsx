import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { FaUserCircle, FaDollarSign, FaWallet, FaBalanceScale, FaChartLine } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
  });
  const [recent, setRecent] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [userName, setUserName] = useState('User');

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Income form state
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeError, setIncomeError] = useState('');

  // Global search state
  // Remove: searchQuery, searchResults, searchPage, searching, searchLoading, searchError
  const ROWS_PER_PAGE = 5;

  // Placeholder: Replace with your backend base URL and auth token logic
  const API_BASE = 'http://localhost:8080/api';
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenseRes, incomeRes, alertsRes, recentExpenseRes, recentIncomeRes, profileRes] = await Promise.all([
        axios.get(`${API_BASE}/expense/total`, axiosConfig),
        axios.get(`${API_BASE}/income/total`, axiosConfig),
        axios.get(`${API_BASE}/user/budget-alerts`, axiosConfig),
        axios.get(`${API_BASE}/expense/all`, axiosConfig),
        axios.get(`${API_BASE}/income/all`, axiosConfig),
        axios.get(`${API_BASE}/user/profile`, axiosConfig),
      ]);
      const totalExpense = expenseRes.data;
      const totalIncome = incomeRes.data;
      const balance = totalIncome - totalExpense;
      setSummary({ totalExpense, totalIncome, balance });
      setAlerts(alertsRes.data || []);
      const recentCombined = [
        ...(recentExpenseRes.data || []).map(e => ({ ...e, type: 'Expense' })),
        ...(recentIncomeRes.data || []).map(i => ({ ...i, type: 'Income' })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      setRecent(recentCombined);
      setUserName(profileRes.data?.name || 'User');
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Expense Modal logic
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseError('');
    if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
      setExpenseError('Please enter a valid amount.');
      return;
    }
    setExpenseLoading(true);
    try {
      await axios.post(
        `${API_BASE}/expense/add`,
        {
          amount: Number(expenseAmount),
          description: expenseDescription,
          date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        },
        axiosConfig
      );
      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseDescription('');
      fetchData();
    } catch (err) {
      setExpenseError(
        err.response?.data?.message || 'Failed to add expense. Please try again.'
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // Income Modal logic
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setIncomeError('');
    if (!incomeAmount || isNaN(incomeAmount) || Number(incomeAmount) <= 0) {
      setIncomeError('Please enter a valid amount.');
      return;
    }
    setIncomeLoading(true);
    try {
      await axios.post(
        `${API_BASE}/income/add`,
        {
          amount: Number(incomeAmount),
          description: incomeDescription,
          date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        },
        axiosConfig
      );
      setShowIncomeModal(false);
      setIncomeAmount('');
      setIncomeDescription('');
      fetchData();
    } catch (err) {
      setIncomeError(
        err.response?.data?.message || 'Failed to add income. Please try again.'
      );
    } finally {
      setIncomeLoading(false);
    }
  };

  // Pagination logic
  const getPaginatedData = (records, page) => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return records.slice(start, start + ROWS_PER_PAGE);
  };

  const getPageCount = (records) => Math.ceil(records.length / ROWS_PER_PAGE);

  // Pagination controls
  const Pagination = ({ page, setPage, pageCount }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '16px 0' }}>
      <button
        className={styles.buttonSecondary}
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        style={{ minWidth: 32 }}
      >Prev</button>
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i + 1}
          className={styles.buttonSecondary}
          style={{
            fontWeight: page === i + 1 ? 700 : 500,
            background: page === i + 1 ? 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' : '',
            color: page === i + 1 ? 'white' : '#6366f1',
            minWidth: 32,
          }}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className={styles.buttonSecondary}
        onClick={() => setPage(page + 1)}
        disabled={page === pageCount}
        style={{ minWidth: 32 }}
      >Next</button>
    </div>
  );

  // Mini chart data for recent activity
  const miniChartData = recent.map((item, idx) => ({
    name: item.date ? item.date.slice(5, 10) : `#${idx + 1}`,
    value: item.amount,
    type: item.type,
  })).reverse();

  // Avatar initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Modal forms
  const ExpenseModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowExpenseModal(false)}>&times;</button>
        <h3>Add Expense</h3>
        <form onSubmit={handleExpenseSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Amount</label>
            <input
              type="number"
              className={styles.input}
              placeholder="$0.00"
              value={expenseAmount}
              onChange={e => setExpenseAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Description"
              value={expenseDescription}
              onChange={e => setExpenseDescription(e.target.value)}
            />
          </div>
          {expenseError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{expenseError}</div>}
          <button type="submit" className={styles.buttonPrimary} disabled={expenseLoading}>
            {expenseLoading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );

  const IncomeModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowIncomeModal(false)}>&times;</button>
        <h3>Add Income</h3>
        <form onSubmit={handleIncomeSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Amount</label>
            <input
              type="number"
              className={styles.input}
              placeholder="$0.00"
              value={incomeAmount}
              onChange={e => setIncomeAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Description"
              value={incomeDescription}
              onChange={e => setIncomeDescription(e.target.value)}
            />
          </div>
          {incomeError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{incomeError}</div>}
          <button type="submit" className={styles.buttonPrimary} disabled={incomeLoading}>
            {incomeLoading ? 'Adding...' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700 }}>
            <FaUserCircle size={40} style={{ marginRight: 6 }} />
            <span style={{ fontSize: 22 }}>{getInitials(userName)}</span>
          </div>
          <div>
            <h2 className={styles.title} style={{ margin: 0 }}>Dashboard</h2>
            <p className={styles.subtitle} style={{ margin: 0 }}>Welcome back, {userName}!</p>
          </div>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaDollarSign color="#dc2626" /> Total Expenses</div>
            <div className={styles.summaryValue} style={{ color: '#dc2626' }}>${summary.totalExpense.toLocaleString()}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaWallet color="#059669" /> Total Income</div>
            <div className={styles.summaryValue} style={{ color: '#059669' }}>${summary.totalIncome.toLocaleString()}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaBalanceScale color="#4c1d95" /> Balance</div>
            <div className={styles.summaryValue} style={{ color: summary.balance >= 0 ? '#4c1d95' : '#dc2626' }}>${summary.balance.toLocaleString()}</div>
          </div>
        </div>
        {/* Mini chart for recent activity */}
        <div className={styles.section} style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: 8 }}><FaChartLine /> Recent Activity Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={miniChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.section}>
          <h3>Recent Activity</h3>
          <ul className={styles.activityList}>
            {recent.length === 0 && <li>No recent activity.</li>}
            {recent.map((item, idx) => (
              <li key={idx} className={styles.activityItem}>
                <span>{item.type}: {item.description || item.categoryName || 'No description'}</span>
                <span className={styles.activityAmount} style={{ color: item.type === 'Expense' ? '#dc2626' : '#059669' }}>
                  {item.type === 'Expense' ? '-' : '+'}${item.amount?.toLocaleString?.() ?? item.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.section}>
          <h3>Budget Alerts</h3>
          <ul className={styles.alertList}>
            {alerts.length === 0 && <li>No alerts.</li>}
            {alerts.map((alert, idx) => (
              <li key={idx} className={styles.alertItem}>{alert}</li>
            ))}
          </ul>
        </div>
        <div className={styles.actions}>
          <button className={styles.buttonPrimary} onClick={() => setShowExpenseModal(true)}>Add Expense</button>
          <button className={styles.buttonSecondary} onClick={() => setShowIncomeModal(true)}>Add Income</button>
        </div>
      </div>
      {showExpenseModal && <ExpenseModal />}
      {showIncomeModal && <IncomeModal />}
    </div>
  );
};

export default Dashboard;
