// import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from './Components/AuthContext';

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

// import VerifyEmail from "./Pages/VerifyEmail";

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
import RecycleManagement from "./Pages/ManagerPages/RecycleManagement";
import RequestSpecialWasteManagement from "./Pages/ManagerPages/RequestSpecialWasteManagement";

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
import RequestSpecialWaste from "./Pages/UserPages/RequestSpecialWaste";

// TruckDriver pages
import HomePageForTruckDrivers from "./Pages/TruckDriversPages/HomePageForTruckDrivers";
import DriverAnnouncementPage from "./Pages/TruckDriversPages/DriverAnnouncementPage";
import DriverNotificationsPage from "./Pages/TruckDriversPages/DriverNotificationsPage";
import DriverPollsPage from "./Pages/TruckDriversPages/DriverPollsPage";
import DriversRequiredTasksPage from "./Pages/TruckDriversPages/DriversRequiredTasksPage";
import DriverSettingsPage from "./Pages/TruckDriversPages/DriverSettingsPage";
import Recycle from "./Pages/TruckDriversPages/Recycle";  // TruckDriver pages

// Navbar Components
import NavbarManager from "./Components/NavbarManager";
import NavbarUser from "./Components/UserNavbar";
import NavbarTruckDriver from "./Components/TruckDriverNavbar";

// Importing toastify
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Authentication
// import AuthProvider from "./Components/AuthContext";
import withAuthorization from "./Components/Hoc";
// Authentication manager pages
const ProtectedHomePageForManagers = withAuthorization(HomePageForManagers, [
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
]);
const ProtectedManageAnnouncement = withAuthorization(ManageAnnouncement, [
  "Admin",
  "AnnouncementManagement",
]);
const ProtectedManageTrucks = withAuthorization(ManageTrucks,[
  "Admin",
  "TruckManagement",
]);
const ProtectedManageReportsAndDataAnalysis = withAuthorization(
  ManageReportsAndDataAnalysis,
  ["Admin", "ReportsAndDataAnalysisManagement"]
);
const ProtectedCommunityEngagementManagement = withAuthorization(
  CommunityEngagementManagement,
  ["Admin", "CommunityEngagementManagement"]
);
const ProtectedUserManagement = withAuthorization(UserManagement,[
  "Admin",
  "UserManagement"
]);
const ProtectedPollsManagement = withAuthorization(PollsManagement,[
  "Admin",
  "PollsManagement"
]);
const ProtectedRecycleManagement = withAuthorization(RecycleManagement,[
  "Admin",
  "RecylingManagemnet"
]);
const ProtectedRewardsManagement = withAuthorization(RewardsManagement,[
  "Admin",
  "RewardsManagement"
]);
const ProtectedRequestSpecialWasteManagement = withAuthorization(RequestSpecialWasteManagement,[
  "Admin",
  "RequestSpecialWasteManagement",
  "AnnouncementManagement"
]);
const ProtectedWasteBinManagement = withAuthorization(WasteBinManagement,[
  "Admin",
  "WasteBinManagement"
]);
const ProtectedSettings = withAuthorization(Settings,[
  "Admin",
  "TruckManagement",
  "AnnouncementManagement",
  "ReportsAndDataAnalysisManagement",
  "CommunityEngagementManagement",
  "UserManagement",
  "PollsManagement",
  "RewardsManagement",
  "WasteBinManagement",
  "RecycleManagment",

]);
const ProtectedNotifications = withAuthorization(Notifications,[
  "Admin",
  "TruckManagement",
  "AnnouncementManagement",
  "ReportsAndDataAnalysisManagement",
  "CommunityEngagementManagement",
  "UserManagement",
  "PollsManagement",
  "RewardsManagement",
  "WasteBinManagement",
  "RecycleManagment",
  "RequestSpecialWasteManagement",
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
const ProtectedRequestSpecialWaste = withAuthorization(RequestSpecialWaste);



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
      <Route path="/managerDashboard" element={<LayoutManager />}>
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
        <Route path="userManagement" element={<ProtectedUserManagement />} />
        <Route path="pollsManagement" element={<ProtectedPollsManagement />} />
        <Route
          path="rewardsManagement"
          element={<ProtectedRewardsManagement />}
        />
        <Route
          path="wasteBinManagement"
          element={<ProtectedWasteBinManagement />}
        />
        <Route path="settings" element={<ProtectedSettings />} />
        <Route path="notifications" element={<ProtectedNotifications />} />
        <Route path="RecycleManagement" element={<ProtectedRecycleManagement />} />
        <Route path="RequestSpecialWasteManagement" element={<ProtectedRequestSpecialWasteManagement />} />
        
      </Route>


      {/* User Routes */}
      <Route path="/userDashboard" element={<LayoutUser />}>
        <Route index element={<ProtectedHomePageForUsers/>} />
        <Route path="aboutUs" element={<ProtectedAboutUsPage />} />
        <Route path="contactUs/" element={<ProtectedContactUsPage />} />
        <Route path="faq" element={<ProtectedFAQPage />} />
        <Route path="communityEngagement" element={<ProtectedCommunityEngagementManagemen />} />
        <Route path="notifications" element={<ProtectedNotificationPage />} />
        <Route path="settings" element={<ProtectedSettingsPage />} />
        <Route path="polls" element={<ProtectedPollsPage />} />
        <Route path="rewards" element={<ProtectedRewardsPage />} />
        <Route path="userAnnouncement" element={<ProtectedUserAnnouncementPage />} />
        <Route path="reports" element={<ProtectedReportsPage />} />
        <Route path="requestSpecialWaste" element={<ProtectedRequestSpecialWaste />} />
        
      </Route>

      {/* Truck Driver Routes */}
      <Route path="/truckDriverDashboard" element={<LayoutTruckDriver />}>
        <Route index element={<ProtectedHomePageForTruckDrivers/>} />
        <Route path="driverAnnouncement" element={<ProtectedDriverAnnouncementPage />} />
        <Route path="driverNotifications" element={<ProtectedDriverNotificationsPage />} />
        <Route path="driverPolls" element={<ProtectedDriverPollsPage />} />
        <Route path="requiredTasks" element={<ProtectedDriverRequiredTasksPage />} />
        <Route path="DriverSettingsPage" element={<ProtectedDriverSettingsPage />} />
        <Route path="recycle" element={<Recycle />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="/login" element={<Login myrole="Admin" />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registeration" element={<Registeration />} />
      {/* <Route path="/verify-email/:token" element={<VerifyEmail />} /> */}

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
