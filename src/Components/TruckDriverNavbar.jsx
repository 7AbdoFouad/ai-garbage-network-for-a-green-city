import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Add useLocation
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa";
import "./ManagerNavbar.css";
import { useParams } from "react-router-dom";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {id} = useParams();
      const location = useLocation(); // Get current location
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <button className="menu-btn" onClick={toggleSidebar}>
        <FaBars className="toggle-icon" />
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        <ul className="sidebar-links">
          <li>
            <NavLink 
              to={`/truckDriverDashboard`} 
              // Add end prop here
               className={({ isActive }) => 
                // Check if we're exactly at the home route
                (isActive && location.pathname === "/truckDriverDashboard/") 
                  ? "nav-link active" 
                  : "nav-link"
              }
            >
              Home
            </NavLink>
          </li>
         
          <li>
            <NavLink 
              to="requiredTasks" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              Available Tasks 
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="driverNotifications" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              My Tasks
            </NavLink>
          </li>
          <li>
            <NavLink 
              to={`DriverSettingsPage`} 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="Recycle" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
             Available Paid Tasks 
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="Acceptedtask" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
             Accepted Paid Tasks
            </NavLink>
          </li>
        </ul>
      </div>

      <div className={`overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
    </>
  );
};

export default CustomNavbar;