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
//             <NavLink to={`/managerDashboard`} className="nav-link" onClick={toggleSidebar}>
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
//             <NavLink to={`userManagement`} className="nav-link" onClick={toggleSidebar}>
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
//             <NavLink to={`settings`} className="nav-link" onClick={toggleSidebar}>
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

// src/Components/CustomNavbar.jsx
import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./ManagerNavbar.css";
import useAuth from "../hooks/useAuth";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();                       // ← get `user` directly
  const userPermissions = user?.Permissions || [];  // ← guard against undefined

  const routes = [
    {
      path: `/managerDashboard`,
      label: "Home",
      requiredRoles: [
        "Admin",
        "TruckManagement",
        "AnnouncementManagement",
        "ReportsAndDataAnalysisManagement",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
        "RecylingManagemnet",
        "RequestSpecialWasteManagement",
      ],
    },
    {
      path: `/managerDashboard/manageAnnouncement`,
      label: "Announcement Management",
      requiredRoles: ["Admin", "AnnouncementManagement"],
    },
    {
      path: `/managerDashboard/manageTrucks`,
      label: "Warehouse Management",
      requiredRoles: ["Admin", "TruckManagement"],
    },
    {
      path: `/managerDashboard/wasteBinManagement`,
      label: "Warehouse Store",
      requiredRoles: ["Admin", "WasteBinManagement"],
    },
    {
      path: `/managerDashboard/rewardsManagement`,
      label: "Rewards Management",
      requiredRoles: ["Admin", "RewardsManagement"],
    },
    {
      path: `/managerDashboard/communityEngagementManagement`,
      label: "Community Engagement Management",
      requiredRoles: ["Admin", "CommunityEngagementManagement"],
    },
    {
      path: `/managerDashboard/userManagement`,
      label: "User Management",
      requiredRoles: ["Admin", "UserManagement"],
    },
    {
      path: `/managerDashboard/pollsManagement`,
      label: "Polls Management",
      requiredRoles: ["Admin", "PollsManagement"],
    },
    {
      path: `/managerDashboard/RecycleManagement`,
      label: "Recycle Management",
      requiredRoles: ["Admin", "RecylingManagemnet"],
    },
    {
      path: `/managerDashboard/RequestSpecialWasteManagement`,
      label: "Request Waste Management",
      requiredRoles: [
        "Admin",
        "RequestSpecialWasteManagement",
        "AnnouncementManagement",
      ],
    },
    {
      path: `/managerDashboard/notifications`,
      label: "Notifications",
      requiredRoles: [
        "Admin",
        "TruckManagement",
        "AnnouncementManagement",
        "ReportsAndDataAnalysisManagement",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
        "RecylingManagemnet",
        "RequestSpecialWasteManagement",
      ],
    },
    {
      path: `/managerDashboard/settings`,
      label: "Settings",
      requiredRoles: [
        "Admin",
        "TruckManagement",
        "AnnouncementManagement",
        "ReportsAndDataAnalysisManagement",
        "CommunityEngagementManagement",
        "UserManagement",
        "PollsManagement",
        "RewardsManagement",
        "WasteBinManagement",
      ],
    },
    {
      path: `/managerDashboard/manageReportsAndDataAnalysis`,
      label: "Reports & Data Analysis Management",
      requiredRoles: ["Admin", "ReportsAndDataAnalysisManagement"],
    },
  ];

  const toggleSidebar = () => setSidebarOpen((open) => !open);

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

      {sidebarOpen && <div className="overlay" onClick={toggleSidebar} />}
    </>
  );
};

export default CustomNavbar;
