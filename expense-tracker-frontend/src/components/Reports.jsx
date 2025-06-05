import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaArrowUp, FaArrowDown, FaChartPie, FaDollarSign, FaWallet } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:8080/api';

const COLORS = ['#6366f1', '#059669', '#dc2626', '#f59e42', '#4c1d95', '#8b5cf6', '#fbbf24', '#10b981'];

const Reports = () => {
  const [monthlyExpense, setMonthlyExpense] = useState({});
  const [monthlyIncome, setMonthlyIncome] = useState({});
  const [weeklyExpense, setWeeklyExpense] = useState({});
  const [weeklyIncome, setWeeklyIncome] = useState({});
  const [highestCategory, setHighestCategory] = useState(null);
  const [lowestCategory, setLowestCategory] = useState(null);
  const [avgMonthlyExpense, setAvgMonthlyExpense] = useState(0);
  const [avgMonthlyIncome, setAvgMonthlyIncome] = useState(0);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }

        // Set up axios config with token
        const axiosConfig = {
          headers: { Authorization: `Bearer ${token}` },
        };

        console.log('Fetching analytics data with token:', token);

        // Fetch all analytics data in parallel with proper error handling
        const [mExpRes, mIncRes, wExpRes, wIncRes, highCatRes, lowCatRes, avgExpRes, avgIncRes, dashRes] = 
          await Promise.all([
            axios.get(`${API_BASE}/user/analytics/monthly-expense`, axiosConfig).catch(err => {
              console.error('Monthly expense error:', err.response || err);
              return { data: {} };
            }),
            axios.get(`${API_BASE}/user/analytics/monthly-income`, axiosConfig).catch(err => {
              console.error('Monthly income error:', err.response || err);
              return { data: {} };
            }),
            axios.get(`${API_BASE}/user/analytics/weekly-expense`, axiosConfig).catch(err => {
              console.error('Weekly expense error:', err.response || err);
              return { data: {} };
            }),
            axios.get(`${API_BASE}/user/analytics/weekly-income`, axiosConfig).catch(err => {
              console.error('Weekly income error:', err.response || err);
              return { data: {} };
            }),
            axios.get(`${API_BASE}/user/analytics/highest-category`, axiosConfig).catch(err => {
              console.error('Highest category error:', err.response || err);
              return { data: null };
            }),
            axios.get(`${API_BASE}/user/analytics/lowest-category`, axiosConfig).catch(err => {
              console.error('Lowest category error:', err.response || err);
              return { data: null };
            }),
            axios.get(`${API_BASE}/user/analytics/average-monthly-expense`, axiosConfig).catch(err => {
              console.error('Avg monthly expense error:', err.response || err);
              return { data: 0 };
            }),
            axios.get(`${API_BASE}/user/analytics/average-monthly-income`, axiosConfig).catch(err => {
              console.error('Avg monthly income error:', err.response || err);
              return { data: 0 };
            }),
            axios.get(`${API_BASE}/user/dashboard`, axiosConfig).catch(err => {
              console.error('Dashboard error:', err.response || err);
              return { data: { expensesByCategory: {} } };
            }),
          ]);

        // Process and set the data
        setMonthlyExpense(mExpRes.data || {});
        setMonthlyIncome(mIncRes.data || {});
        setWeeklyExpense(wExpRes.data || {});
        setWeeklyIncome(wIncRes.data || {});
        setHighestCategory(highCatRes.data || null);
        setLowestCategory(lowCatRes.data || null);
        setAvgMonthlyExpense(avgExpRes.data || 0);
        setAvgMonthlyIncome(avgIncRes.data || 0);

        // Process category breakdown for pie chart
        const dashData = dashRes.data?.expensesByCategory || {};
        const categoryData = Object.entries(dashData).map(([name, value]) => ({ name, value }));
        setCategoryBreakdown(categoryData);

        console.log('Analytics data loaded successfully');
      } catch (err) {
        console.error('Error fetching analytics:', err);
        const statusCode = err.response?.status;
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        setError(`Failed to load analytics data: ${statusCode ? `Status ${statusCode} - ` : ''}${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportCsv = async () => {
    setCsvLoading(true);
    setCsvError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCsvError('Authentication error. Please log in again.');
        setCsvLoading(false);
        return;
      }

      const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      };

      const res = await axios.get(`${API_BASE}/user/export/csv`, axiosConfig);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully!');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setCsvError(`Failed to export CSV: ${err.response?.status ? `Status ${err.response.status} - ` : ''}${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setCsvLoading(false);
    }
  };

  // Convert object to array for charts
  const objToChartData = (obj) => Object.entries(obj).map(([k, v]) => ({ name: k, value: v }));

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.pageContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.card} style={{ maxWidth: 1100 }}>
        <h2 className={styles.title}>Reports & Analytics</h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 18, color: '#6366f1', marginBottom: 10 }}>Loading analytics data...</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 18, color: '#dc2626', marginBottom: 10 }}>{error}</div>
            <button 
              className={styles.buttonPrimary} 
              onClick={handleRefresh}
              style={{ marginTop: 20 }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className={styles.summaryCard} style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaDollarSign color="#dc2626" size={22} />
                  <span className={styles.summaryLabel}>Avg. Monthly Expense</span>
                </div>
                <div className={styles.summaryValue} style={{ color: '#dc2626' }}>${typeof avgMonthlyExpense === 'number' ? avgMonthlyExpense.toLocaleString() : '0'}</div>
              </div>
              <div className={styles.summaryCard} style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaWallet color="#059669" size={22} />
                  <span className={styles.summaryLabel}>Avg. Monthly Income</span>
                </div>
                <div className={styles.summaryValue} style={{ color: '#059669' }}>${typeof avgMonthlyIncome === 'number' ? avgMonthlyIncome.toLocaleString() : '0'}</div>
              </div>
              <div className={styles.summaryCard} style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaArrowUp color="#dc2626" size={22} />
                  <span className={styles.summaryLabel}>Highest Category</span>
                </div>
                <div className={styles.summaryValue} style={{ color: '#dc2626', fontSize: 18 }}>
                  {highestCategory ? `${highestCategory[0]}: $${highestCategory[1]}` : 'N/A'}
                </div>
              </div>
              <div className={styles.summaryCard} style={{ minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaArrowDown color="#059669" size={22} />
                  <span className={styles.summaryLabel}>Lowest Category</span>
                </div>
                <div className={styles.summaryValue} style={{ color: '#059669', fontSize: 18 }}>
                  {lowestCategory ? `${lowestCategory[0]}: $${lowestCategory[1]}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16 }}>Monthly Expense Trend</h3>
                {Object.keys(monthlyExpense).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={objToChartData(monthlyExpense)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16 }}>Monthly Income Trend</h3>
                {Object.keys(monthlyIncome).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={objToChartData(monthlyIncome)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16 }}>Weekly Expense Trend</h3>
                {Object.keys(weeklyExpense).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={objToChartData(weeklyExpense)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f59e42" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16 }}>Weekly Income Trend</h3>
                {Object.keys(weeklyIncome).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={objToChartData(weeklyIncome)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24, maxWidth: 400 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FaChartPie /> Expense by Category</h3>
                {categoryBreakdown.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {categoryBreakdown.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 320, background: '#f5f7fa', borderRadius: 16, padding: 24, maxWidth: 400 }}>
                <h3 style={{ color: '#6366f1', marginBottom: 16 }}>Export Data</h3>
                <p style={{ marginBottom: 20, color: '#6b7280' }}>Download your expense and income data as a CSV file for further analysis in spreadsheet applications.</p>
                <button
                  className={styles.buttonPrimary}
                  onClick={handleExportCsv}
                  disabled={csvLoading}
                  style={{ width: '100%', padding: '10px 0' }}
                >
                  {csvLoading ? 'Exporting...' : 'Export to CSV'}
                </button>
                {csvError && <div style={{ color: '#dc2626', marginTop: 10, fontSize: 14 }}>{csvError}</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;