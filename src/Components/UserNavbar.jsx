import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa"; // Changed icon to manager icon
import "./ManagerNavbar.css";
import useUser from "../hooks/useUser";
import { useParams } from "react-router-dom";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  //   const { fetchUser } = useUser();
  //   const[user,setuser]=useState({})
  //   useEffect(() => {
  //       const fetchuser=async()=>{
  //        const tuser=await fetchUser(id)
  //           setuser(tuser)
  //       }
  //       fetchuser();
  //   }, [id]);
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
            <span className="greeting-text">Hello, {(user.name)}</span>
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
            <NavLink
              to={`/userDashboard/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="aboutUs" className="nav-link" onClick={toggleSidebar}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`contactUs/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Contact Us
            </NavLink>
          </li>
          <li>
            <NavLink to="faq" className="nav-link" onClick={toggleSidebar}>
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`communityEngagement/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Community Engagement
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`notifications/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`settings/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`polls/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Polls
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`rewards/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Rewards
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`userAnnouncement/${id}`}
              className="nav-link"
              onClick={toggleSidebar}
            >
              Announcement
            </NavLink>
          </li>
          <li>
            <NavLink to="reports" className="nav-link" onClick={toggleSidebar}>
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to={`requestSpecialWaste/${id}`} className="nav-link" onClick={toggleSidebar}>
              RequestSpecialWaste
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
