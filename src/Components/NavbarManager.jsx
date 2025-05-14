// import React, { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";
// import { FaUserTie, FaBars, FaTimes } from "react-icons/fa"; // Changed icon to manager icon
// import "./ManagerNavbar.css";
// import useUser from "../hooks/useUser";
// import { useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import useAuth from "../hooks/useAuth";
// const CustomNavbar = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const {id}= useParams();
//   const { cookies } = useAuth();
//   const HomePageForManagers = [
//     "admin",
//     "ManageTrucks",
//     "ManageAnnouncement",
//     "ManageReportsAndDataAnalysis",
//     "CommunityEngagementManagement",
//     "UserManagement",
//     "PollsManagement",
//     "RewardsManagement",
//     "WasteBinManagement"
//   ];
//   const ManageAnnouncement = [
//     "admin",
//     "ManageAnnouncement",
//   ];
//   const ManageTrucks =[
//     "admin",
//     "ManageTrucks",
//   ];
//   const ManageReportsAndDataAnalysis =
//     ["admin", "ManageReportsAndDataAnalysis"]
//   ;
//   const CommunityEngagementManagement =
//     ["admin", "CommunityEngagementManagement"]
//   ;
//   const UserManagement = [
//     "admin",
//     "UserManagement"
//   ];
//   const PollsManagement = [
//     "admin",
//     "PollsManagement"
//   ];
//   const RewardsManagement = [
//     "admin",
//     "RewardsManagement"
//   ];
//   const WasteBinManagement =[
//     "admin",
//     "WasteBinManagement"
//   ];
//   const Settings =[
//     "admin",
//     "ManageTrucks",
//     "ManageAnnouncement",
//     "ManageReportsAndDataAnalysis",
//     "CommunityEngagementManagement",
//     "UserManagement",
//     "PollsManagement",
//     "RewardsManagement",
//     "WasteBinManagement",

//   ];
//   const Notifications = [
//     "admin",
//     "ManageTrucks",
//     "ManageAnnouncement",
//     "ManageReportsAndDataAnalysis",
//     "CommunityEngagementManagement",
//     "UserManagement",
//     "PollsManagement",
//     "RewardsManagement",
//     "WasteBinManagement",
//   ];
//   const user=cookies.user.Permissions;

//     // const { fetchManager } = useUser();
//     // const[manager,setmanagers]=useState({})
//     // useEffect(() => {
//     //     const fetchmanager=async()=>{
//     //      const manager=await fetchManager(id);
//     //      setmanagers(manager);
//     //     }
//     //     fetchmanager();
//     // }, [id]);
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <>
//       {/* Main Navbar */}
//       {/* <nav className="navbar custom-navbar">
//         <div className="container custom-container d-flex justify-content-center align-items-center"> */}
//           {/* Centered Title */}
//           {/* <div className="navbar-title d-flex align-items-center">
//             <FaUserTie className="logo-icon" />
//             <span className="greeting-text">Hello, {(manager.name)}</span>
//           </div> */}

//           {/* Mobile Toggle Button */}
//           <button className="menu-btn" onClick={toggleSidebar}>
//             <FaBars className="toggle-icon" />
//           </button>
//         {/* </div>
//       </nav> */}

//       {/* Sidebar Menu */}
//       <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
//         <button className="close-btn" onClick={toggleSidebar}>
//           <FaTimes />
//         </button>

//         <ul className="sidebar-links">
//           <li>
//             <NavLink to={`/managerDashboard/${id}`} className="nav-link" onClick={toggleSidebar}>
//                Home
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="manageAnnouncement" className="nav-link" onClick={toggleSidebar}>
//              Announcement Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="manageTrucks" className="nav-link" onClick={toggleSidebar}>
//              Trucks Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="wasteBinManagement" className="nav-link" onClick={toggleSidebar}>
//             Waste Bin Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="rewardsManagement" className="nav-link" onClick={toggleSidebar}>
//             Rewards Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="communityEngagementManagement" className="nav-link" onClick={toggleSidebar}>
//             Community Engagement Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to={`userManagement/${id}`} className="nav-link" onClick={toggleSidebar}>
//             User Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="pollsManagement" className="nav-link" onClick={toggleSidebar}>
//             Polls Management
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="notifications" className="nav-link" onClick={toggleSidebar}>
//             Notifications
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to={`settings/${id}`} className="nav-link" onClick={toggleSidebar}>
//             Settings
//             </NavLink>
//           </li>
//           <li>
//             <NavLink to="manageReportsAndDataAnalysis" className="nav-link" onClick={toggleSidebar}>
//              Reports & Data Analysis Management
//             </NavLink>
//           </li>
//         </ul>
//       </div>

//       {/* Overlay when sidebar is open */}
//       {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
//     </>
//   );
// };

// export default CustomNavbar;

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa";
import "./ManagerNavbar.css";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { cookies } = useAuth();
  const userPermissions = cookies.user.Permissions || [];

  // Define permission-based routes
  const routes = [
    {
      path: `/managerDashboard/${id}`,
      label: "Home",
      requiredRoles: [
        "admin",
        "ManageTrucks",
        "ManageAnnouncement",
        "ManageReportsAndDataAnalysis",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
        "RecycleManagement",
        "RequestSpecialWasteManagement",

      ],
    },
    {
      path: "manageAnnouncement",
      label: "Announcement Management",
      requiredRoles: ["admin", "ManageAnnouncement"],
    },
    {
      path: "manageTrucks",
      label: "WareHouse Management",
      requiredRoles: ["admin", "ManageTrucks"],
    },
    {
      path: "wasteBinManagement",
      label: "WareHouse Store",
      requiredRoles: ["admin", "WasteBinManagement"],
    },
    {
      path: "rewardsManagement",
      label: "Rewards Management",
      requiredRoles: ["admin", "RewardsManagement"],
    },
    {
      path: "communityEngagementManagement",
      label: "Community Engagement Management",
      requiredRoles: ["admin", "CommunityEngagementManagement"],
    },
    {
      path: `userManagement/${id}`,
      label: "User Management",
      requiredRoles: ["admin", "UserManagement"],
    },
    {
      path: "pollsManagement",
      label: "Polls Management",
      requiredRoles: ["admin", "PollsManagement"],
    },
    {
      path: "RecycleManagement",
      label: "Recycle Management",
      requiredRoles: ["admin", "RecycleManagement"],
    },
    {
      path: "RequestSpecialWasteManagement",
      label: "Request Waste Management",
      requiredRoles: ["admin", "RequestSpecialWasteManagement"],
    },
    {
      path: "notifications",
      label: "Notifications",
      requiredRoles: [
        "admin",
        "ManageTrucks",
        "ManageAnnouncement",
        "ManageReportsAndDataAnalysis",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
        "RecycleManagement",
        "RequestSpecialWasteManagement",
      ],
    },
    {
      path: `settings/${id}`,
      label: "Settings",
      requiredRoles: [
        "admin",
        "ManageTrucks",
        "ManageAnnouncement",
        "ManageReportsAndDataAnalysis",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
      ],
    },
    {
      path: "manageReportsAndDataAnalysis",
      label: "Reports & Data Analysis Management",
      requiredRoles: ["admin", "ManageReportsAndDataAnalysis"],
    },
  ];

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
          {routes.map(({ path, label, requiredRoles }) =>
            requiredRoles.some((role) => userPermissions.includes(role)) ? (
              <li key={path}>
                <NavLink to={path} className="nav-link" onClick={toggleSidebar}>
                  {label}
                </NavLink>
              </li>
            ) : null
          )}
        </ul>
      </div>

      {sidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default CustomNavbar;
