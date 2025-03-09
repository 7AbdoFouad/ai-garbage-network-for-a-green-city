// import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import {
  Route,
  Outlet,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import NavBar from "./Components/Navbar";
// Public pages
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Registeration from "./Pages/Registeration";
import ForgetPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import NotFound from "./Pages/NotFound";

// Manager pages
import HomePageForManagers from "./Pages/ManagerPages/HomePageForManagers";
import ManageAnnouncement from "./Pages/ManagerPages/ManageAnnouncement";
import ManageTrucks from "./Pages/ManagerPages/ManageTrucks";
import ManageReportsAndDataAnalysis from "./Pages/ManagerPages/ManageReportsAndDataAnalysis";
import CommunityEngagementManagement from "./Pages/ManagerPages/CommunityEngagementManagement";
import UserManagement from "./Pages/ManagerPages/UserManagement";
import PollsManagement from "./Pages/ManagerPages/PollsManagement";
import RewardsManagement from "./Pages/ManagerPages/RewardsManagement";
import WasteBinManagement from "./Pages/ManagerPages/WasteBinManagement";
import Settings from "./Pages/ManagerPages/Settings";
import Notifications from "./Pages/ManagerPages/Notifications";
// User pages
import HomePageForUsers from "./Pages/UserPages/HomePageForUsers";
import AboutUsPage from "./Pages/UserPages/AboutUsPage";
import ContactUsPage from "./Pages/UserPages/ContactUsPage";
import FAQPage from "./Pages/UserPages/FAQPage";
import CommunityEngagementPage from "./Pages/UserPages/CommunityEngagementPage";
import NotificationsPage from "./Pages/UserPages/NotificationsPage";
import SettingPage from "./Pages/UserPages/SettingPage";
import PollsPage from "./Pages/UserPages/PollsPage";
import RewardsPage from "./Pages/UserPages/RewardsPage";
import UserAnnouncementPage from "./Pages/UserPages/UserAnnouncementPage";
import ReportsPage from "./Pages/UserPages/ReportsPage";

// TruckDriver pages
import HomePageForTruckDrivers from "./Pages/TruckDriversPages/HomePageForTruckDrivers";
import DriverAnnouncementPage from "./Pages/TruckDriversPages/DriverAnnouncementPage";
import DriverNotificationsPage from "./Pages/TruckDriversPages/DriverNotificationsPage";
import DriverPollsPage from "./Pages/TruckDriversPages/DriverPollsPage";
import DriversRequiredTasksPage from "./Pages/TruckDriversPages/DriversRequiredTasksPage";
import DriverSettingsPage from "./Pages/TruckDriversPages/DriverSettingsPage";

// Navbar Components
import NavbarManager from "./Components/NavbarManager";
import NavbarUser from "./Components/UserNavbar";
import NavbarTruckDriver from "./Components/TruckDriverNavbar";

// Importing toastify
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Authentication
import AuthProvider from "./Components/AuthContext";
import withAuthorization from "./Components/Hoc";
// Authentication manager pages
const ProtectedHomePageForManagers = withAuthorization(HomePageForManagers, [
  "admin",
  "ManageTrucks",
  "ManageAnnouncement",
  "ManageReportsAndDataAnalysis",
  "CommunityEngagementManagement",
  "UserManagement",
  "PollsManagement",
  "RewardsManagement",
  "WasteBinManagement"
]);
const ProtectedManageAnnouncement = withAuthorization(ManageAnnouncement, [
  "admin",
  "ManageAnnouncement",
]);
const ProtectedManageTrucks = withAuthorization(ManageTrucks,[
  "admin",
  "ManageTrucks",
]);
const ProtectedManageReportsAndDataAnalysis = withAuthorization(
  ManageReportsAndDataAnalysis,
  ["admin", "ManageReportsAndDataAnalysis"]
);
const ProtectedCommunityEngagementManagement = withAuthorization(
  CommunityEngagementManagement,
  ["admin", "CommunityEngagementManagement"]
);
const ProtectedUserManagement = withAuthorization(UserManagement,[
  "admin",
  "UserManagement"
]);
const ProtectedPollsManagement = withAuthorization(PollsManagement,[
  "admin",
  "PollsManagement"
]);
const ProtectedRewardsManagement = withAuthorization(RewardsManagement,[
  "admin",
  "RewardsManagement"
]);
const ProtectedWasteBinManagement = withAuthorization(WasteBinManagement,[
  "admin",
  "WasteBinManagement"
]);
const ProtectedSettings = withAuthorization(Settings,[
  "admin",
  "ManageTrucks",
  "ManageAnnouncement",
  "ManageReportsAndDataAnalysis",
  "CommunityEngagementManagement",
  "UserManagement",
  "PollsManagement",
  "RewardsManagement",
  "WasteBinManagement",

]);
const ProtectedNotifications = withAuthorization(Notifications,[
  "admin",
  "ManageTrucks",
  "ManageAnnouncement",
  "ManageReportsAndDataAnalysis",
  "CommunityEngagementManagement",
  "UserManagement",
  "PollsManagement",
  "RewardsManagement",
  "WasteBinManagement",
]);
// Authentication user pages
const ProtectedHomePageForUsers = withAuthorization(HomePageForUsers);
const ProtectedAboutUsPage = withAuthorization(AboutUsPage);
const ProtectedContactUsPage = withAuthorization(ContactUsPage);
const ProtectedFAQPage = withAuthorization(FAQPage);
const ProtectedCommunityEngagementManagemen = withAuthorization(CommunityEngagementPage);
const ProtectedNotificationPage = withAuthorization(NotificationsPage);
const ProtectedSettingsPage = withAuthorization(SettingPage);
const ProtectedPollsPage = withAuthorization(PollsPage);
const ProtectedRewardsPage = withAuthorization(RewardsPage);
const ProtectedUserAnnouncementPage = withAuthorization(UserAnnouncementPage);
const ProtectedReportsPage = withAuthorization(ReportsPage);

// Authentication TruckDrivers pages
const ProtectedHomePageForTruckDrivers = withAuthorization(HomePageForTruckDrivers);
const ProtectedDriverAnnouncementPage = withAuthorization(DriverAnnouncementPage);
const ProtectedDriverNotificationsPage = withAuthorization(DriverNotificationsPage);
const ProtectedDriverPollsPage = withAuthorization(DriverPollsPage);
const ProtectedDriverRequiredTasksPage = withAuthorization(DriversRequiredTasksPage);
const ProtectedDriverSettingsPage = withAuthorization(DriverSettingsPage);

// Layout Components
const Layout = () => (
  <>
    <NavBar />
    <Outlet />
  </>
);

const LayoutManager = () => (
  <>
    <NavbarManager />
    <Outlet />
  </>
);

const LayoutUser = () => (
  <>
    <NavbarUser />
    <Outlet />
  </>
);

const LayoutTruckDriver = () => (
  <>
    <NavbarTruckDriver />
    <Outlet />
  </>
);

// Define Routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<LandingPage />} />

      {/* Manager Routes */}
      <Route path="/managerDashboard/:id" element={<LayoutManager />}>
        <Route index element={<ProtectedHomePageForManagers />} />
        <Route
          path="manageAnnouncement"
          element={<ProtectedManageAnnouncement />}
        />
        <Route path="manageTrucks" element={<ProtectedManageTrucks />} />
        <Route
          path="manageReportsAndDataAnalysis"
          element={<ProtectedManageReportsAndDataAnalysis />}
        />
        <Route
          path="communityEngagementManagement"
          element={<ProtectedCommunityEngagementManagement />}
        />
        <Route path="userManagement/:id" element={<ProtectedUserManagement />} />
        <Route path="pollsManagement" element={<ProtectedPollsManagement />} />
        <Route
          path="rewardsManagement"
          element={<ProtectedRewardsManagement />}
        />
        <Route
          path="wasteBinManagement"
          element={<ProtectedWasteBinManagement />}
        />
        <Route path="settings/:id" element={<ProtectedSettings />} />
        <Route path="notifications" element={<ProtectedNotifications />} />
      </Route>


      {/* User Routes */}
      <Route path="/userDashboard/:id" element={<LayoutUser />}>
        <Route index element={<ProtectedHomePageForUsers/>} />
        <Route path="aboutUs" element={<ProtectedAboutUsPage />} />
        <Route path="contactUs" element={<ProtectedContactUsPage />} />
        <Route path="faq" element={<ProtectedFAQPage />} />
        <Route path="communityEngagement/:id" element={<ProtectedCommunityEngagementManagemen />} />
        <Route path="notifications" element={<ProtectedNotificationPage />} />
        <Route path="settings/:id" element={<ProtectedSettingsPage />} />
        <Route path="polls/:id" element={<ProtectedPollsPage />} />
        <Route path="rewards/:id" element={<ProtectedRewardsPage />} />
        <Route path="userAnnouncement/:id" element={<ProtectedUserAnnouncementPage />} />
        <Route path="reports" element={<ProtectedReportsPage />} />
      </Route>

      {/* Truck Driver Routes */}
      <Route path="/truckDriverDashboard/:id" element={<LayoutTruckDriver />}>
        <Route index element={<ProtectedHomePageForTruckDrivers/>} />
        <Route path="driverAnnouncement" element={<ProtectedDriverAnnouncementPage />} />
        <Route path="driverNotifications" element={<ProtectedDriverNotificationsPage />} />
        <Route path="driverPolls" element={<ProtectedDriverPollsPage />} />
        <Route path="requiredTasks" element={<ProtectedDriverRequiredTasksPage />} />
        <Route path="settings/:id" element={<ProtectedDriverSettingsPage />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="/login" element={<Login myrole="admin" />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password/:id" element={<ResetPassword />} />
      <Route path="/registeration" element={<Registeration />} />

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

// App Component
const App = () => {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <RouterProvider router={router} />
    </AuthProvider>

  );
};

export default App;
