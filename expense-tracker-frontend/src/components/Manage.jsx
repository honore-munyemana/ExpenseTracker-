import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css'; // Reuse dashboard styles for consistency
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');
const axiosConfig = {
  headers: { Authorization: `Bearer ${token}` },
};

const TABS = [
  { label: 'Expenses', key: 'expenses' },
  { label: 'Income', key: 'income' },
];

const ROWS_PER_PAGE = 5;

const Manage = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Pagination state
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ amount: '', description: '', date: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Business summary
  const balance = incomeTotal - expenseTotal;

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setFetchError('');
    if (!token) {
      setFetchError('Session expired or not logged in. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const [expenseRes, incomeRes, expenseTotalRes, incomeTotalRes] = await Promise.all([
        axios.get(`${API_BASE}/expense/all`, axiosConfig),
        axios.get(`${API_BASE}/income/all`, axiosConfig),
        axios.get(`${API_BASE}/expense/total`, axiosConfig),
        axios.get(`${API_BASE}/income/total`, axiosConfig),
      ]);
      setExpenses(expenseRes.data || []);
      setIncomes(incomeRes.data || []);
      setExpenseTotal(expenseTotalRes.data || 0);
      setIncomeTotal(incomeTotalRes.data || 0);
    } catch (err) {
      setFetchError('Failed to fetch data. Please check your connection or log in again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Reset page when switching tabs
  useEffect(() => {
    if (activeTab === 'expenses') setExpensePage(1);
    if (activeTab === 'income') setIncomePage(1);
  }, [activeTab]);

  // Add record
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    setFormLoading(true);
    try {
      if (activeTab === 'expenses') {
        await axios.post(
          `${API_BASE}/expense/add`,
          {
            amount: Number(form.amount),
            description: form.description,
            date: form.date || new Date().toISOString().slice(0, 10),
          },
          axiosConfig
        );
      } else {
        await axios.post(
          `${API_BASE}/income/add`,
          {
            amount: Number(form.amount),
            description: form.description,
            date: form.date || new Date().toISOString().slice(0, 10),
          },
          axiosConfig
        );
      }
      setShowAddModal(false);
      setForm({ amount: '', description: '', date: '' });
      fetchData();
    } catch (err) {
      setFormError('Failed to add record. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit record (placeholder, not wired to backend yet)
  const handleEdit = (record) => {
    setEditRecord(record);
    setForm({
      amount: record.amount,
      description: record.description || '',
      date: record.date || '',
    });
    setShowEditModal(true);
    setFormError('');
  };

  // Delete record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      if (activeTab === 'expenses') {
        await axios.delete(`${API_BASE}/expense/${id}`, axiosConfig);
      } else {
        await axios.delete(`${API_BASE}/income/${id}`, axiosConfig);
      }
      fetchData();
    } catch (err) {
      // Optionally handle error
    }
  };

  // Edit submit (placeholder, not wired to backend yet)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('Editing is not implemented yet.');
    // TODO: Implement PUT request for edit
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

  // Filter records by search query (case-insensitive, matches any column)
  const filterRecords = (records) => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.trim().toLowerCase();
    return records.filter(rec => {
      const amount = String(rec.amount ?? '').toLowerCase();
      const description = (rec.description ?? rec.categoryName ?? '').toLowerCase();
      const date = (rec.date ?? '').toLowerCase();
      return amount.includes(q) || description.includes(q) || date.includes(q);
    });
  };

  // Table/list for records
  const renderTable = (records, page, setPage) => {
    const paginated = getPaginatedData(records, page);
    const pageCount = getPageCount(records);
    return (
      <>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ background: '#f5f7fa', color: '#6366f1' }}>
                <th style={{ padding: 10, fontWeight: 600 }}>Amount</th>
                <th style={{ padding: 10, fontWeight: 600 }}>Description</th>
                <th style={{ padding: 10, fontWeight: 600 }}>Date</th>
                <th style={{ padding: 10, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>No records found.</td></tr>
              )}
              {paginated.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 10, color: activeTab === 'expenses' ? '#dc2626' : '#059669', fontWeight: 600 }}>
                    {activeTab === 'expenses' ? '-' : '+'}${rec.amount?.toLocaleString?.() ?? rec.amount}
                  </td>
                  <td style={{ padding: 10 }}>{rec.description || rec.categoryName || '-'}</td>
                  <td style={{ padding: 10 }}>{rec.date || '-'}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      style={{ marginRight: 8, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => handleEdit(rec)}
                    >Edit</button>
                    <button
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => handleDelete(rec.id)}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && <Pagination page={page} setPage={setPage} pageCount={pageCount} />}
      </>
    );
  };

  // Modal components
  const AddModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>&times;</button>
        <h3>Add {activeTab === 'expenses' ? 'Expense' : 'Income'}</h3>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Amount</label>
            <input
              type="number"
              className={styles.input}
              placeholder="$0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
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
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Date</label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          {formError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{formError}</div>}
          <button type="submit" className={styles.buttonPrimary} disabled={formLoading}>
            {formLoading ? 'Adding...' : `Add ${activeTab === 'expenses' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );

  const EditModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>&times;</button>
        <h3>Edit {activeTab === 'expenses' ? 'Expense' : 'Income'}</h3>
        <form onSubmit={handleEditSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Amount</label>
            <input
              type="number"
              className={styles.input}
              placeholder="$0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
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
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Date</label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          {formError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{formError}</div>}
          <button type="submit" className={styles.buttonPrimary} disabled={formLoading}>
            {formLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {fetchError && <div style={{ color: '#dc2626', marginBottom: 16, fontWeight: 600 }}>{fetchError}</div>}
        {/* Business summary */}
        <div className={styles.summaryGrid} style={{ marginBottom: 32 }}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Expenses</div>
            <div className={styles.summaryValue} style={{ color: '#dc2626' }}>
              ${expenseTotal.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Income</div>
            <div className={styles.summaryValue} style={{ color: '#059669' }}>
              ${incomeTotal.toLocaleString()}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Balance</div>
            <div className={styles.summaryValue} style={{ color: balance >= 0 ? '#4c1d95' : '#dc2626' }}>
              ${balance.toLocaleString()}
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' : '#f5f7fa',
                color: activeTab === tab.key ? 'white' : '#6366f1',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                padding: '10px 32px',
                cursor: 'pointer',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(99,102,241,0.07)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className={styles.title} style={{ margin: 0, fontSize: 24 }}>
            {activeTab === 'expenses' ? 'Expenses' : 'Income'}
          </h2>
          <button className={styles.buttonPrimary} onClick={() => setShowAddModal(true)}>
            Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
          </button>
        </div>
        {/* Search input */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <input
            type="text"
            placeholder="Search by any column..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              minWidth: 220,
              outline: 'none',
              boxShadow: '0 1px 2px rgba(99,102,241,0.04)'
            }}
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {activeTab === 'expenses'
              ? renderTable(filterRecords(expenses), expensePage, setExpensePage)
              : renderTable(filterRecords(incomes), incomePage, setIncomePage)}
          </>
        )}
      </div>
      {showAddModal && <AddModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default Manage; 