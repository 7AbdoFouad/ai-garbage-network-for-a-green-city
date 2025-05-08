import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa"; // Changed icon to manager icon
import "./ManagerNavbar.css";
import { useParams } from "react-router-dom";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {id}= useParams();
  //   const { fetchTruckDriver } = useUser();
    // const[TruckDriver,setTruckDrivers]=useState({})
    // useEffect(() => {
    //     const fetchmanager=async()=>{
    //      const truckdriver=await fetchTruckDriver(id);
    //      setTruckDrivers(truckdriver)
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
            <span className="greeting-text">Hello, {(TruckDriver.name)}</span>
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
            <NavLink to={`/truckDriverDashboard/${id}`} className="nav-link" onClick={toggleSidebar}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="driverAnnouncement" className="nav-link" onClick={toggleSidebar}>
             Announcement
            </NavLink>
          </li>
          <li>
            <NavLink to="driverNotifications" className="nav-link" onClick={toggleSidebar}>
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="driverPolls" className="nav-link" onClick={toggleSidebar}>
              Polls
            </NavLink>
          </li>
          <li>
            <NavLink to="requiredTasks" className="nav-link" onClick={toggleSidebar}>
              Required Tasks 
            </NavLink>
          </li>
          <li>
            <NavLink to={`settings/${id}`} className="nav-link" onClick={toggleSidebar}>
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="Recycle" className="nav-link" onClick={toggleSidebar}>
              Recycling 
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
