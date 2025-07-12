import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Add useLocation
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa";
import "./ManagerNavbar.css";
import useUser from "../hooks/useUser";
import { useParams } from "react-router-dom";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
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
              to="/userDashboard"
              className={({ isActive }) => 
                // Check if we're exactly at the home route
                (isActive && location.pathname === "/userDashboard/") 
                  ? "nav-link active" 
                  : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="aboutUs" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`contactUs`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Contact Us
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="faq" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`communityEngagement`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Community Engagement
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`notifications`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`settings`}
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
              to={`polls`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Polls
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to={`rewards`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Rewards
            </NavLink>
          </li> */}
          <li>
            <NavLink
              to={`userAnnouncement`}
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              Announcement
            </NavLink>
          </li>
          {/* <li>
            <NavLink 
              to="reports" 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              Reports
            </NavLink>
          </li> */}
          <li>
            <NavLink 
              to={`requestSpecialWaste`} 
              className={({ isActive }) => 
                isActive ? "nav-link active" : "nav-link"
              } 
              onClick={toggleSidebar}
            >
              Special Waste Service
            </NavLink>
          </li>
        </ul>
      </div>

      <div className={`overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
    </>
  );
};

export default CustomNavbar;