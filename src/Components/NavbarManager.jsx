import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa"; // Changed icon to manager icon
import "./ManagerNavbar.css";
import useUser from "../hooks/useUser";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {id}= useParams();
    // const { fetchManager } = useUser();
    // const[manager,setmanagers]=useState({})
    // useEffect(() => {
    //     const fetchmanager=async()=>{
    //      const manager=await fetchManager(id);
    //      setmanagers(manager);
    //     }
    //     fetchmanager();
    // }, [id]);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Main Navbar */}
      {/* <nav className="navbar custom-navbar">
        <div className="container custom-container d-flex justify-content-center align-items-center"> */}
          {/* Centered Title */}
          {/* <div className="navbar-title d-flex align-items-center">
            <FaUserTie className="logo-icon" />
            <span className="greeting-text">Hello, {(manager.name)}</span>
          </div> */}

          {/* Mobile Toggle Button */}
          <button className="menu-btn" onClick={toggleSidebar}>
            <FaBars className="toggle-icon" />
          </button>
        {/* </div>
      </nav> */}

      {/* Sidebar Menu */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        <ul className="sidebar-links">
          <li>
            <NavLink to={`/managerDashboard/${id}`} className="nav-link" onClick={toggleSidebar}>
               Home
            </NavLink>
          </li>
          <li>
            <NavLink to="manageAnnouncement" className="nav-link" onClick={toggleSidebar}>
             Announcement Management
            </NavLink>
          </li>
          <li>
            <NavLink to="manageTrucks" className="nav-link" onClick={toggleSidebar}>
             Trucks Management
            </NavLink>
          </li>
          <li>
            <NavLink to="wasteBinManagement" className="nav-link" onClick={toggleSidebar}>
            Waste Bin Management
            </NavLink>
          </li>
          <li>
            <NavLink to="rewardsManagement" className="nav-link" onClick={toggleSidebar}>
            Rewards Management
            </NavLink>
          </li>
          <li>
            <NavLink to="communityEngagementManagement" className="nav-link" onClick={toggleSidebar}>
            Community Engagement Management
            </NavLink>
          </li>
          <li>
            <NavLink to={`userManagement/${id}`} className="nav-link" onClick={toggleSidebar}>
            User Management
            </NavLink>
          </li>
          <li>
            <NavLink to="pollsManagement" className="nav-link" onClick={toggleSidebar}>
            Polls Management
            </NavLink>
          </li>
          <li>
            <NavLink to="notifications" className="nav-link" onClick={toggleSidebar}>
            Notifications 
            </NavLink>
          </li>
          <li>
            <NavLink to={`settings/${id}`} className="nav-link" onClick={toggleSidebar}>
            Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="manageReportsAndDataAnalysis" className="nav-link" onClick={toggleSidebar}>
             Reports & Data Analysis Management
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default CustomNavbar;
