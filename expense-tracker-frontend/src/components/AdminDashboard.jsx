import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';

const API_BASE = 'http://localhost:8080/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', currency: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/user/admin/users`, getAxiosConfig());
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data || 'Failed to load users. Please check your connection and permissions.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, currency: user.currency || '', password: '' });
    setFormError('');
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setForm({ name: '', email: '', currency: '', password: '' });
    setFormError('');
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedUser(null);
    setFormError('');
    setFormLoading(false);
  };

  // Add user logic
  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await axios.post(`${API_BASE}/user/admin/users`, form, getAxiosConfig());
      closeModals();
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setFormError(err.response?.data || 'Failed to add user');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit user logic
  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await axios.put(`${API_BASE}/user/admin/users/${selectedUser.id}`, form, getAxiosConfig());
      closeModals();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setFormError(err.response?.data || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user logic
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/user/admin/users/${user.id}`, getAxiosConfig());
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Admin Dashboard</h2>
        <button className={styles.buttonPrimary} onClick={openAddModal} style={{ marginBottom: 16 }}>Add New User</button>
        
        {error && (
          <div style={{ color: '#dc2626', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '0.25rem' }}>
            {error}
            <button 
              onClick={fetchUsers} 
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}
        
        {loading ? (
          <div>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            {error ? null : 'No users found. Add a new user to get started.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Currency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.currency}</td>
                  <td>
                    <button className={styles.buttonSecondary} onClick={() => openEditModal(user)} style={{ marginRight: 8 }}>Edit</button>
                    <button className={styles.buttonSecondary} style={{ color: '#dc2626' }} onClick={() => handleDeleteUser(user)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Edit User Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeModals}>&times;</button>
            <h3>Edit User</h3>
            <form onSubmit={handleEditUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input type="email" className={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Currency</label>
                <input type="text" className={styles.input} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Password (leave blank to keep unchanged)</label>
                <input type="password" className={styles.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              {formError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{formError}</div>}
              <button type="submit" className={styles.buttonPrimary} style={{ marginRight: 8 }} disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className={styles.buttonSecondary} onClick={closeModals}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeModals}>&times;</button>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input type="email" className={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Currency</label>
                <input type="text" className={styles.input} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Password</label>
                <input type="password" className={styles.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              {formError && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{formError}</div>}
              <button type="submit" className={styles.buttonPrimary} style={{ marginRight: 8 }} disabled={formLoading}>{formLoading ? 'Adding...' : 'Add User'}</button>
              <button type="button" className={styles.buttonSecondary} onClick={closeModals}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;