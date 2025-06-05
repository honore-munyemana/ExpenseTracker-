import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Manage', path: '/manage' },
  { label: 'Reports', path: '/reports' },
  { label: 'Profile', path: '/profile' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header style={{
      background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '0 2rem',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: 'white',
          color: '#6366f1',
          borderRadius: '50%',
          fontWeight: 700,
          fontSize: 22,
          marginRight: 12,
        }}>$</span>
        <span style={{ fontWeight: 700, fontSize: 20, fontFamily: 'Montserrat, sans-serif', letterSpacing: 1 }}>ExpenseTracker</span>
      </div>
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
        <input
          type="text"
          placeholder="Global search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            fontSize: 15,
            minWidth: 180,
            outline: 'none',
            color: '#333',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 15,
            padding: '6px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Search
        </button>
      </form>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === link.path ? '#fff' : '#e0e7ff',
              fontWeight: location.pathname === link.path ? 700 : 500,
              fontSize: 16,
              padding: '8px 0',
              borderBottom: location.pathname === link.path ? '2.5px solid #fff' : '2.5px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-bottom 0.2s',
              marginRight: 8,
            }}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          style={{
            background: 'white',
            color: '#6366f1',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 15,
            padding: '8px 18px',
            marginLeft: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99,102,241,0.07)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;