import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;