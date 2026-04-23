import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiBook, FiShoppingBag, FiStar, FiBarChart2, FiLayers, FiMail } from 'react-icons/fi';

const links = [
  { to: '/admin', icon: <FiGrid />, label: 'Overview', end: true },
  { to: '/admin/menu', icon: <FiBook />, label: 'Menu Items' },
  { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
  { to: '/admin/tables', icon: <FiLayers />, label: 'Tables & QR' },
  { to: '/admin/feedback', icon: <FiStar />, label: 'Feedback' },
  { to: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  { to: '/admin/offers', icon: <FiMail />, label: 'Send Offers' },
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div style={{ marginBottom: 24, padding: '0 16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            Admin Panel
          </div>
        </div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
