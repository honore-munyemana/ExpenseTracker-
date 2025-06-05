import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');
const axiosConfig = {
  headers: { Authorization: `Bearer ${token}` },
};

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', currency: '' });
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '', currency: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, currencyRes, auditRes] = await Promise.all([
          axios.get(`${API_BASE}/user/profile`, axiosConfig),
          axios.get(`${API_BASE}/user/currency`, axiosConfig),
          axios.get(`${API_BASE}/user/audit-log`, axiosConfig),
        ]);
        setProfile({
          name: profileRes.data.name,
          email: profileRes.data.email,
          currency: currencyRes.data,
        });
        setAuditLog(auditRes.data || []);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // Edit name
  const handleEditName = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.name.trim()) {
      setFormError('Name cannot be empty.');
      return;
    }
    setFormLoading(true);
    try {
      // Always send current email and currency to avoid overwriting them
      await axios.put(`${API_BASE}/user/profile`, {
        name: form.name,
        email: profile.email,
        currency: profile.currency
      }, axiosConfig);
      setProfile((p) => ({ ...p, name: form.name }));
      setFormSuccess('Name updated successfully.');
      setShowEditModal(false);
    } catch (err) {
      setFormError('Failed to update name.');
    } finally {
      setFormLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.password || form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setFormLoading(true);
    try {
      // Assuming a /user/change-password endpoint exists
      await axios.put(`${API_BASE}/user/profile`, { ...profile, password: form.password }, axiosConfig);
      setFormSuccess('Password updated successfully.');
      setShowPasswordModal(false);
    } catch (err) {
      setFormError('Failed to update password.');
    } finally {
      setFormLoading(false);
    }
  };

  // Change currency
  const handleChangeCurrency = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.currency.trim()) {
      setFormError('Currency cannot be empty.');
      return;
    }
    setFormLoading(true);
    try {
      await axios.put(`${API_BASE}/user/currency`, form.currency, axiosConfig);
      setProfile((p) => ({ ...p, currency: form.currency }));
      setFormSuccess('Currency updated successfully.');
      setShowCurrencyModal(false);
    } catch (err) {
      setFormError('Failed to update currency.');
    } finally {
      setFormLoading(false);
    }
  };

  // Modals
  const EditModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>&times;</button>
        <h3>Edit Name</h3>
        <form onSubmit={handleEditName}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
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

  const PasswordModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowPasswordModal(false)}>&times;</button>
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '1rem' }}>
            <label>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Confirm Password</label>
            <input
              type="password"
              className={styles.input}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
              minLength={8}
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

  const CurrencyModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setShowCurrencyModal(false)}>&times;</button>
        <h3>Change Currency</h3>
        <form onSubmit={handleChangeCurrency}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Currency (e.g. USD, EUR, GBP)</label>
            <input
              type="text"
              className={styles.input}
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              required
              maxLength={3}
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
        <h2 className={styles.title}>Profile</h2>
        <div className={styles.section}>
          <div style={{ marginBottom: 16 }}>
            <strong>Name:</strong> {profile.name}
            <button className={styles.buttonSecondary} style={{ marginLeft: 12 }} onClick={() => { setForm({ ...form, name: profile.name }); setShowEditModal(true); }}>Edit</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Email:</strong> {profile.email}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Currency:</strong> {profile.currency}
            <button className={styles.buttonSecondary} style={{ marginLeft: 12 }} onClick={() => { setForm({ ...form, currency: profile.currency }); setShowCurrencyModal(true); }}>Change</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <button className={styles.buttonPrimary} onClick={() => setShowPasswordModal(true)}>Change Password</button>
          </div>
          {formSuccess && <div style={{ color: '#059669', marginBottom: '1rem' }}>{formSuccess}</div>}
        </div>
        <div className={styles.section}>
          <h3>Audit Log</h3>
          <ul className={styles.activityList}>
            {auditLog.length === 0 && <li>No audit log entries.</li>}
            {auditLog.map((log, idx) => (
              <li key={idx} className={styles.activityItem}>
                <span>{log.action || log.event || 'Action'}</span>
                <span style={{ color: '#6366f1', fontSize: 13 }}>{log.timestamp || log.date || ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showEditModal && <EditModal />}
      {showPasswordModal && <PasswordModal />}
      {showCurrencyModal && <CurrencyModal />}
    </div>
  );
};

export default Profile;