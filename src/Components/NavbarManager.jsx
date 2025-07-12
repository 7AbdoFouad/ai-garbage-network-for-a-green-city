import React, { useEffect, useState } from "react";
import { NavLink, useParams , useLocation} from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./ManagerNavbar.css";
import useAuth from "../hooks/useAuth";

const CustomNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const userPermissions = user?.Permissions || [];
    const location = useLocation(); // Get current location

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
      exact: true
    },
    {
      path: `/managerDashboard/manageAnnouncement`,
      label: "Announcements Management",
      requiredRoles: ["Admin", "AnnouncementManagement"],
    },
    {
      path: `/managerDashboard/manageTrucks`,
      label: "Warehouse Reports",
      requiredRoles: ["Admin", "RecylingManagemnet"],
    },
    {
      path: `/managerDashboard/wasteBinManagement`,
      label: "Warehouse Inventory",
      requiredRoles: ["Admin", "RecylingManagemnet"],
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
      label: "Driver Reports Management",
      requiredRoles: ["Admin", "AnnouncementManagement"],
    },
    {
      path: `/managerDashboard/RequestSpecialWasteManagement`,
      label: "Paid Announcements Management",
      requiredRoles: [
        "Admin",
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
      label: "Warehouses Management",
      requiredRoles: ["Admin", "RecylingManagemnet"],
    },
    {
      path: `/managerDashboard/RegionsBinsManagement`,
      label: "Regions_Bins Management",
      requiredRoles: ["Admin", "WasteBinManagement"],
    },
  ];

  useEffect(() => {
    //click home after login
  
  }, []);
    
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
        <div className="sidebar-content">
          <ul className="sidebar-links">
            {routes.map((route) => {
              const { path, label, requiredRoles, exact } = route;

              // Skip rendering if user lacks required roles
              if (!requiredRoles.some((role) => userPermissions.includes(role))) {
                return null;
              }

              return (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    end={exact} // Exact match for "Home"
                    onClick={toggleSidebar}
                  >
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div
        className={`overlay ${sidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />
    </>
  );
};

export default CustomNavbar;