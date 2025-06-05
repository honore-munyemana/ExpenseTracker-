import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import axios from 'axios';

const ROWS_PER_PAGE = 5;
const API_BASE = 'http://localhost:8080/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication error. Please log in again.');
      setLoading(false);
      return;
    }

    const axiosConfig = {
      headers: { Authorization: `Bearer ${token}` },
    };

    console.log('Searching for:', query);

    axios.get(`${API_BASE}/user/search?query=${encodeURIComponent(query)}`, axiosConfig)
      .then(res => {
        console.log('Search results:', res.data);
        setResults(res.data || []);
        setPage(1);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to fetch search results. ' + (err.response?.data?.message || err.message || ''));
      })
      .finally(() => setLoading(false));
  }, [query]);

  const getPaginatedData = (records, page) => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return records.slice(start, start + ROWS_PER_PAGE);
  };

  const getPageCount = (records) => Math.ceil(records.length / ROWS_PER_PAGE);

  const handleItemClick = (item) => {
    if (item.type === 'Expense') {
      navigate(`/manage?tab=expenses&highlight=${item.id}`);
    } else if (item.type === 'Income') {
      navigate(`/manage?tab=income&highlight=${item.id}`);
    } else if (item.type === 'Budget') {
      navigate(`/manage?tab=budgets&highlight=${item.id}`);
    }
  };

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

  const paginated = getPaginatedData(results, page);
  const pageCount = getPageCount(results);

  const getAmountColor = (type) => {
    if (type === 'Expense') return '#dc2626';
    if (type === 'Income') return '#059669';
    return '#6366f1';
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h2 className={styles.title} style={{ marginBottom: 16 }}>Search Results</h2>
        <div style={{ marginBottom: 16, color: '#6366f1', fontWeight: 600 }}>
          Query: <span style={{ color: '#4c1d95' }}>{query}</span>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr style={{ background: '#f5f7fa', color: '#6366f1' }}>
                  <th style={{ padding: 10, fontWeight: 600 }}>Type</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>Description</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>Category</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>Date/Period</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No results found.</td></tr>
                )}
                {paginated.map((rec, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }} 
                      onClick={() => handleItemClick(rec)}>
                    <td style={{ padding: 10, fontWeight: 600, color: getAmountColor(rec.type) }}>{rec.type}</td>
                    <td style={{ padding: 10, color: getAmountColor(rec.type) }}>
                      ${rec.amount?.toLocaleString?.() ?? rec.amount}
                      {rec.recurring && <span style={{ marginLeft: 5, fontSize: 12, color: '#6366f1' }}>(recurring)</span>}
                    </td>
                    <td style={{ padding: 10 }}>{rec.description || '-'}</td>
                    <td style={{ padding: 10 }}>{rec.categoryName || '-'}</td>
                    <td style={{ padding: 10 }}>{rec.date || rec.period || '-'}</td>
                    <td style={{ padding: 10 }}>
                      <button 
                        className={styles.buttonSecondary}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(rec);
                        }}
                        style={{ padding: '4px 8px', fontSize: 14 }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pageCount > 1 && <Pagination page={page} setPage={setPage} pageCount={pageCount} />}
      </div>
    </div>
  );
};

export default SearchResults;