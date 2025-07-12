import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Add useLocation
import styles from "./Navbar.module.css";
import useAuth from '../hooks/useAuth';

const CustomNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();    const location = useLocation(); // Get current location
  
  var userrole;
  if (user) {
    if (user.role === 'User') {
      userrole='/userDashboard';
    } else if (user.role === 'TruckDriver') {
      userrole="/truckDriverDashboard" 
    } else {
      // Assume any other role (e.g., Manager, Admin) goes to managerDashboard
      userrole="/managerDashboard"
    }
  }else{
        userrole="/userDashboard2"
  }

  // If not logged in, show the landing page content

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles['custom-container']}>
        {/* Logo & Title */}
        <div className={styles['logo-title']}>
          <img
            src="/src/Components/4530300.jpg"
            className={styles['logo-icon']}
            alt="Logo"
            width={50}
          />
          <div className={styles['navbar-title']}>Green City</div>
        </div>

        {/* Navigation Links for larger screens */}
        <ul className={styles['navbar-nav']}>
          <li className={styles['nav-item']}>
            <NavLink
              to={`${userrole}`}
              // end
              className={({ isActive }) => (isActive && location.pathname === `${userrole}/` ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
              onFocus={(e) => e.target.blur()}
            >
              Home
            </NavLink>
          </li>
          <li className={styles['nav-item']}>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
            >
              Login
            </NavLink>
          </li>
          <li className={styles['nav-item']}>
            <NavLink
              to="/registeration"
              className={({ isActive }) => (isActive ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
            >
              Registration
            </NavLink>
          </li>
        </ul>

        {/* Toggle Button for smaller screens */}
        <div className={styles['navbar-toggler']} onClick={toggleSidebar}>
          <span className={styles['toggle-icon']}>☰</span>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className={`${styles.overlay} ${styles.active}`} onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <button className={styles['close-btn']} onClick={() => setIsSidebarOpen(false)}>×</button>
        <ul className={styles['sidebar-links']}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
              onClick={() => setIsSidebarOpen(false)}
              onFocus={(e) => e.target.blur()}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
              onClick={() => setIsSidebarOpen(false)}
            >
              Login
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/registeration"
              className={({ isActive }) => (isActive ? `${styles['nav-link']} ${styles.active}` : styles['nav-link'])}
              onClick={() => setIsSidebarOpen(false)}
            >
              Registration
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default CustomNavbar;