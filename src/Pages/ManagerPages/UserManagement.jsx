import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Row, Col, Card, Badge } from "react-bootstrap";
import { object, string } from "yup";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FaUser, FaUserTie, FaTruck, FaTrash, FaEdit, FaBell, FaSearch, FaPlus } from "react-icons/fa";
import Cookies from "js-cookie";
import styles from "./UserManagment.module.css";
import { useFormik } from "formik";

const getAuthToken = () => {
  return Cookies.get("token");
};

const schema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters "),
  address: string().required("Address is required").min(3, "Address must be more than 3 characters"),
  role: string().required("Role is required"),
});

const schema2 = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters "),
  address: string().required("Address is required").min(3, "Address must be more than 3 characters"),
});

const managerEditSchema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  address: string().required("Address is required").min(3, "Address must be more than 3 characters"),
  role: string().required("Role is required"),
  password: string().min(8, "Password must be at least 8 characters"),
});

const driverEditSchema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  address: string().required("Address is required").min(3, "Address must be more than 3 characters"),
});

const notifySchema = object().shape({
  reason: string()
    .required("Reply is required")
    .min(10, "Message is too short"),
});

const roleOptions = [
  // { value: "Admin", label: "Admin" },
  { value: "AnnouncementManagement", label: "Announcement Manager" },
  { value: "WasteBinManagement", label: "Bins and Regions Manager" },
  { value: "CommunityEngagementManagement", label: "CommunityEngagement Manager" },
  { value: "UserManagement", label: "Users Manager" },
  { value: "PollsManagement", label: "Polls Manager" },
  { value: "RecylingManagemnet", label: "Recyling Manager" },
  { value: "RequestSpecialWasteManagement", label: "Special Order Manager" },
];

const UserManagement = () => {
  const BASE_URL = "https://greencityapi.runasp.net";
  const { id } = useParams();

  // State declarations
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [truckDrivers, setTruckDrivers] = useState([]);
  const [currentUser, setUser] = useState({});
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [isEditingTruckDriver, setIsEditingTruckDriver] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedTruckDriver, setSelectedTruckDriver] = useState(null);
  const [loadingDeleteUsers, setLoadingDeleteUsers] = useState({});
  const [loadingDeleteManager, setLoadingDeleteManager] = useState({});
  const [loadingDeleteTruckDriver, setLoadingDeleteTruckDriver] = useState({});
  const [currentManager, setCurrentManager] = useState(null);
  const [selectedContactUs, setselectedContactUs] = useState(null);
  const [modalShowNotify, setModalShowNotify] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchTerm3, setSearchTerm3] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showAddManager, setShowAddManager] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [managersPage, setManagersPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isManagersLoading, setIsManagersLoading] = useState(true);
  const [isDriversLoading, setIsDriversLoading] = useState(true);
  const itemsPerPage = 5;

  // Stats for dashboard
  const stats = [
    { title: "Total Users", value: users.length, icon: <FaUser className={styles.statIcon} />, color: "#4caf50" },
    { title: "Managers", value: managers.length, icon: <FaUserTie className={styles.statIcon} />, color: "#2196f3" },
    { title: "Truck Drivers", value: truckDrivers.length, icon: <FaTruck className={styles.statIcon} />, color: "#ff9800" },
  ];

  // Fetch data
  useEffect(() => {
    fetchUsers();
    fetchManagers();
    fetchTruckDrivers();
    fetchCurrentUser();
  }, [id]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetch(`/api/Users`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchManagers = async () => {
    setIsManagersLoading(true);
    try {
      const response = await fetch(`/api/Managers`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      // remove Admin role from managers
      const filteredData = data.filter((manager) => manager.role !== "Admin");
      setManagers(filteredData);
    } catch (error) {
      toast.error("Failed to fetch managers");
    } finally {
      setIsManagersLoading(false);
    }
  };

  const fetchTruckDrivers = async () => {
    setIsDriversLoading(true);
    try {
      const response = await fetch(`/api/TruckDrivers`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setTruckDrivers(data);
    } catch (error) {
      toast.error("Failed to fetch truck drivers");
    } finally {
      setIsDriversLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`/api/Managers/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setUser(data);
      setCurrentManager(data);
    } catch (error) {
      toast.error("Failed to fetch current user");
    }
  };

  // Delete functions
  const handleDeleteUser = async (userId) => {
    setLoadingDeleteUsers((prev) => ({ ...prev, [userId]: true }));
    try {
      await fetch(`/api/Users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoadingDeleteUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteManager = async (managerId) => {
    setLoadingDeleteManager((prev) => ({ ...prev, [managerId]: true }));
    try {
      await fetch(`/api/Managers/${managerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      fetchManagers();
      toast.success("Manager deleted successfully");
    } catch (error) {
      toast.error("Failed to delete manager");
    } finally {
      setLoadingDeleteManager((prev) => ({ ...prev, [managerId]: false }));
    }
  };

  const handleDeleteTruckDriver = async (driverId) => {
    setLoadingDeleteTruckDriver((prev) => ({ ...prev, [driverId]: true }));
    try {
      await fetch(`/api/TruckDrivers/${driverId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      fetchTruckDrivers();
      toast.success("Truck driver deleted successfully");
    } catch (error) {
      toast.error("Failed to delete truck driver");
    } finally {
      setLoadingDeleteTruckDriver((prev) => ({ ...prev, [driverId]: false }));
    }
  };

  // Edit handlers
  const handleEditManager = (manager) => {
    setSelectedManager(manager);
    setIsEditingManager(true);
  };

  const handleEditTruckDriver = (driver) => {
    setSelectedTruckDriver(driver);
    setIsEditingTruckDriver(true);
  };

  // Form handling for adding manager
  const [submitingManager, setSubmitingManager] = useState(false);
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      role: "",
    },
    validationSchema: schema,
    onSubmit: async (data) => {
      setSubmitingManager(true);
      try {
        const formData = new FormData();
        formData.append("Name", data.name);
        formData.append("Email", data.email);
        formData.append("Phone", data.phone);
        formData.append("Password", data.password);
        formData.append("Address", data.address);
        formData.append("Roles", data.role);

        const response = await fetch(`/api/Auth/Register`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          body: formData,
        });

        if (!response.ok) throw new Error("Registration failed");

        fetchManagers();
        toast.success("Manager added successfully!");
        formik.resetForm();
        setShowAddManager(false);
      } catch (error) {
        toast.error("Failed to add manager");
      } finally {
        setSubmitingManager(false);
      }
    },
  });

  // Form handling for adding driver
  const [submitingDriver, setSubmitingDriver] = useState(false);
  const formik2 = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    },
    validationSchema: schema2,
    onSubmit: async (data) => {
      setSubmitingDriver(true);
      try {
        const formData = new FormData();
        formData.append("Name", data.name);
        formData.append("Email", data.email);
        formData.append("Phone", data.phone);
        formData.append("Password", data.password);
        formData.append("Address", data.address);
        formData.append("Roles", "TruckDriver");
        formData.append("ShiftId", 1);
        // formData.append("LicenseNumber", 12345);
        // formData.append("LicenseExpiryDate", "2026-05-04");
        // formData.append("TruckNumber", 1);
        // formData.append("RegionName", "Ismailia Fisrt");

        const response = await fetch(`/api/Auth/Register`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          body: formData,
        });

        if (!response.ok) throw new Error("Registration failed");

        fetchTruckDrivers();
        toast.success("Truck driver added successfully!");
        formik2.resetForm();
        setShowAddDriver(false);
      } catch (error) {
        toast.error("Failed to add truck driver");
      } finally {
        setSubmitingDriver(false);
      }
    },
  });

  // Form handling for editing manager
  const formikEditManager = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "",
      password: "",
    },
    validationSchema: managerEditSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        formData.append("address", values.address);
        formData.append("role", values.role);
        if (values.password) {
          formData.append("password", values.password);
        }

        const response = await fetch(`/api/Managers/${selectedManager.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to update manager");

        fetchManagers();
        toast.success("Manager updated successfully!");
        setIsEditingManager(false);
        setSelectedManager(null);
      } catch (error) {
        toast.error("Failed to update manager");
      }
    },
  });

  useEffect(() => {
    if (selectedManager) {
      formikEditManager.setValues({
        name: selectedManager.name || "",
        email: selectedManager.email || "",
        phone: selectedManager.phone || "",
        address: selectedManager.address || "",
        role: selectedManager.role || "",
      });
    }
  }, [selectedManager]);

  // Form handling for editing driver
  const formikEditDriver = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    validationSchema: driverEditSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        formData.append("address", values.address);

        const response = await fetch(`/api/TruckDrivers/${selectedTruckDriver.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to update driver");

        fetchTruckDrivers();
        toast.success("Driver updated successfully!");
        setIsEditingTruckDriver(false);
        setSelectedTruckDriver(null);
      } catch (error) {
        toast.error("Failed to update driver");
      }
    },
  });

  useEffect(() => {
    if (selectedTruckDriver) {
      formikEditDriver.setValues({
        name: selectedTruckDriver.name || "",
        email: selectedTruckDriver.email || "",
        phone: selectedTruckDriver.phone || "",
        address: selectedTruckDriver.address || "",
      });
    }
  }, [selectedTruckDriver]);

  const addUserNotification = async (content) => {
    try {
      const payload = {
        EmailAddress: "Admin123@example.com",
        Password: "Admin@12345",
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      const response = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const tok = data.jwtToken;

      const user = users.find((user) => user.email === selectedContactUs.email);
      const userId = user ? user.id : null;

      const formData = new FormData();
      formData.append("notificationContent", content);
      formData.append("notificationDate", new Date().toISOString().split("T")[0]);
      await fetch(`/api/Notifications/User/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tok}`,
        },
        body: formData,
      });
    } catch (error) {
      console.error("Failed to add user notification:", error);
    }
  };

  const formikNotify = useFormik({
    initialValues: { reason: "" },
    validationSchema: notifySchema,
    onSubmit: async (values) => {
      try {
        await addUserNotification(values.reason);
        toast.success("Reply sent successfully");
        setModalShowNotify(false);
        setselectedContactUs(null);
        formikNotify.resetForm();
      } catch (err) {
        console.error(err);
      }
    },
  });

  // Filtering
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredManagers = managers.filter((manager) =>
    manager.name.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  const filteredTruckDrivers = truckDrivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm3.toLowerCase())
  );

  // Pagination
  const paginate = (items, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  // Session Storage for Pagination and Active Tab
  useEffect(() => {
    const storedActiveTab = sessionStorage.getItem("activeTab");
    const storedUsersPage = sessionStorage.getItem("usersPage");
    const storedManagersPage = sessionStorage.getItem("managersPage");
    const storedDriversPage = sessionStorage.getItem("driversPage");

    if (storedActiveTab) setActiveTab(storedActiveTab);
    if (storedUsersPage) setUsersPage(parseInt(storedUsersPage, 10));
    if (storedManagersPage) setManagersPage(parseInt(storedManagersPage, 10));
    if (storedDriversPage) setDriversPage(parseInt(storedDriversPage, 10));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem("usersPage", usersPage.toString());
  }, [usersPage]);

  useEffect(() => {
    sessionStorage.setItem("managersPage", managersPage.toString());
  }, [managersPage]);

  useEffect(() => {
    sessionStorage.setItem("driversPage", driversPage.toString());
  }, [driversPage]);

  // Adjust page if it exceeds total pages, but only after data is loaded
  useEffect(() => {
    if (!isUsersLoading) {
      const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
      if (totalPages > 0 && usersPage > totalPages) {
        setUsersPage(totalPages);
      } else if (totalPages === 0) {
        setUsersPage(1);
      }
    }
  }, [isUsersLoading, filteredUsers, itemsPerPage, usersPage]);

  useEffect(() => {
    if (!isManagersLoading) {
      const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
      if (totalPages > 0 && managersPage > totalPages) {
        setManagersPage(totalPages);
      } else if (totalPages === 0) {
        setManagersPage(1);
      }
    }
  }, [isManagersLoading, filteredManagers, itemsPerPage, managersPage]);

  useEffect(() => {
    if (!isDriversLoading) {
      const totalPages = Math.ceil(filteredTruckDrivers.length / itemsPerPage);
      if (totalPages > 0 && driversPage > totalPages) {
        setDriversPage(totalPages);
      } else if (totalPages === 0) {
        setDriversPage(1);
      }
    }
  }, [isDriversLoading, filteredTruckDrivers, itemsPerPage, driversPage]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}><FaUserTie /> User Management Dashboard</h2>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard} style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div className={styles.statContent}>
                <div className={styles.statIconContainer} style={{ backgroundColor: `${stat.color}20` }}>
                  {stat.icon}
                </div>
                <div>
                  <h5 className={styles.statTitle}>{stat.title}</h5>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <FaUser /> Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === "Managers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("Managers")}
        >
          <FaUserTie /> Managers
        </button>
        <button
          className={`${styles.tab} ${activeTab === "drivers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("drivers")}
        >
          <FaTruck /> Drivers
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>User Accounts</h3>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(filteredUsers, usersPage, itemsPerPage).map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <div className={styles.email}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className={styles.actionButton}
                        >
                          <FaTrash /> {loadingDeleteUsers[user.id] ? "Deleting..." : "Delete"}
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setselectedContactUs(user);
                            setModalShowNotify(true);
                          }}
                          className={styles.actionButton}
                        >
                          <FaBell /> Notify
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className={styles.noResults}>
                <p>No users found</p>
              </div>
            )}

            {filteredUsers.length > itemsPerPage && (
              <div className={styles.pagination}>
                <Button
                  variant="outline-success"
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage(usersPage - 1)}
                >
                  Previous
                </Button>
                <span>Page {usersPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}</span>
                <Button
                  variant="outline-success"
                  disabled={usersPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                  onClick={() => setUsersPage(usersPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Managers Tab */}
      {activeTab === "Managers" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Manager Accounts</h3>
            <div>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search Managers..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
            <Button
              variant="success"
              className={styles.addButton}
              onClick={() => setShowAddManager(true)}
            >
              <FaPlus /> Add Manager
            </Button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(filteredManagers, managersPage, itemsPerPage).map((manager, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ backgroundColor: "#2196f3" }}>
                          {manager.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{manager.name}</strong>
                          <div className={styles.email}>{manager.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{manager.email}</div>
                      <div className={styles.phone}>{manager.phone}</div>
                    </td>
                    <td>
                      <Badge bg="primary" className={styles.roleBadge}>
                        {manager.role}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditManager(manager)}
                          className={styles.actionButton}
                        >
                          <FaEdit /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteManager(manager.id)}
                          className={styles.actionButton}
                        >
                          <FaTrash /> {loadingDeleteManager[manager.id] ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredManagers.length === 0 && (
              <div className={styles.noResults}>
                <p>No Managers found</p>
              </div>
            )}

            {filteredManagers.length > itemsPerPage && (
              <div className={styles.pagination}>
                <Button
                  variant="outline-success"
                  disabled={managersPage === 1}
                  onClick={() => setManagersPage(managersPage - 1)}
                >
                  Previous
                </Button>
                <span>Page {managersPage} of {Math.ceil(filteredManagers.length / itemsPerPage)}</span>
                <Button
                  variant="outline-success"
                  disabled={managersPage === Math.ceil(filteredManagers.length / itemsPerPage)}
                  onClick={() => setManagersPage(managersPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === "drivers" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Truck Drivers</h3>
            <div>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm3}
                  onChange={(e) => setSearchTerm3(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
            <div>
              <Button
                variant="success"
                className={`${styles.addButton} `}
                onClick={() => setShowAddDriver(true)}
              >
                <FaPlus /> Add Driver
              </Button>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Contact</th>
                  <th>Truck Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(filteredTruckDrivers, driversPage, itemsPerPage).map((driver, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ backgroundColor: "#ff9800" }}>
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{driver.name}</strong>
                          <div className={styles.email}>{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{driver.email}</div>
                      <div className={styles.phone}>{driver.phone}</div>
                    </td>
                    <td>
                      <div>Truck #{driver.truckNumber}</div>
                      <div>Shift: {driver.shiftId}</div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditTruckDriver(driver)}
                          className={styles.actionButton}
                        >
                          <FaEdit /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTruckDriver(driver.id)}
                          className={styles.actionButton}
                        >
                          <FaTrash /> {loadingDeleteTruckDriver[driver.id] ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTruckDrivers.length === 0 && (
              <div className={styles.noResults}>
                <p>No drivers found</p>
              </div>
            )}

            {filteredTruckDrivers.length > itemsPerPage && (
              <div className={styles.pagination}>
                <Button
                  variant="outline-success"
                  disabled={driversPage === 1}
                  onClick={() => setDriversPage(driversPage - 1)}
                >
                  Previous
                </Button>
                <span>Page {driversPage} of {Math.ceil(filteredTruckDrivers.length / itemsPerPage)}</span>
                <Button
                  variant="outline-success"
                  disabled={driversPage === Math.ceil(filteredTruckDrivers.length / itemsPerPage)}
                  onClick={() => setDriversPage(driversPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      <Modal show={showAddManager} onHide={() => setShowAddManager(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Add New Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <Form.Group className={styles.formGroup}>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formik.errors.name ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formik.touched.name && formik.errors.name}
              />
              {formik.touched.name && formik.errors.name && (
                <Form.Control.Feedback type="invalid">
                  {formik.errors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className={styles.formGroup}>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formik.errors.email ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formik.touched.email && formik.errors.email}
              />
              {formik.touched.email && formik.errors.email && (
                <Form.Control.Feedback type="invalid">
                  {formik.errors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik.errors.phone ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik.touched.phone && formik.errors.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik.errors.password ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik.touched.password && formik.errors.password}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.password}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className={styles.formGroup}>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                placeholder="Enter address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formik.errors.address ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formik.touched.address && formik.errors.address}
              />
              {formik.touched.address && formik.errors.address && (
                <Form.Control.Feedback type="invalid">
                  {formik.errors.address}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className={styles.formGroup}>
              <Form.Label>Role</Form.Label>
              <div className={styles.radioGroup}>
                {roleOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    id={`role-${option.value}`}
                    name="role"
                    label={option.label}
                    value={option.value}
                    onChange={formik.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                    }}
                    onBlur={formik.handleBlur}
                    checked={formik.values.role === option.value}
                    className={styles.radioOption}
                  />
                ))}
              </div>
              {formik.touched.role && formik.errors.role && (
                <div className="text-danger mt-2">{formik.errors.role}</div>
              )}
            </Form.Group>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setShowAddManager(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitingManager}
                className={styles.submitButton}
              >
                {submitingManager ? "Adding..." : "Add Manager"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal show={isEditingManager} onHide={() => setIsEditingManager(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Edit Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikEditManager.handleSubmit} className={styles.form}>
            <Form.Group className={styles.formGroup}>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formikEditManager.values.name}
                onChange={formikEditManager.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikEditManager.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formikEditManager.errors.name ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formikEditManager.touched.name && formikEditManager.errors.name}
              />
              {formikEditManager.touched.name && formikEditManager.errors.name && (
                <Form.Control.Feedback type="invalid">
                  {formikEditManager.errors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className={styles.formGroup}>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formikEditManager.values.email}
                onChange={formikEditManager.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikEditManager.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formikEditManager.errors.email ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formikEditManager.touched.email && formikEditManager.errors.email}
              />
              {formikEditManager.touched.email && formikEditManager.errors.email && (
                <Form.Control.Feedback type="invalid">
                  {formikEditManager.errors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formikEditManager.values.phone}
                    onChange={formikEditManager.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formikEditManager.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formikEditManager.errors.phone ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formikEditManager.touched.phone && formikEditManager.errors.phone}
                  />
                  {formikEditManager.touched.phone && formikEditManager.errors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formikEditManager.errors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formikEditManager.values.address}
                    onChange={formikEditManager.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formikEditManager.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formikEditManager.errors.address ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formikEditManager.touched.address && formikEditManager.errors.address}
                  />
                  {formikEditManager.touched.address && formikEditManager.errors.address && (
                    <Form.Control.Feedback type="invalid">
                      {formikEditManager.errors.address}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className={styles.formGroup}>
              <Form.Label>Role</Form.Label>
              <div className={styles.radioGroup}>
                {roleOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    id={`edit-role-${option.value}`}
                    name="role"
                    label={option.label}
                    value={option.value}
                    onChange={formikEditManager.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                    }}
                    onBlur={formikEditManager.handleBlur}
                    checked={formikEditManager.values.role === option.value}
                    className={styles.radioOption}
                  />
                ))}
              </div>
              {formikEditManager.touched.role && formikEditManager.errors.role && (
                <div className="text-danger mt-2">{formikEditManager.errors.role}</div>
              )}
            </Form.Group>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setIsEditingManager(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formikEditManager.isSubmitting}
                className={styles.submitButton}
              >
                {formikEditManager.isSubmitting ? "Updating..." : "Update Manager"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Add Driver Modal */}
      <Modal show={showAddDriver} onHide={() => setShowAddDriver(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Add New Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formik2.handleSubmit} className={styles.form}>
            <Form.Group className={styles.formGroup}>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formik2.values.name}
                onChange={formik2.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formik2.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formik2.errors.name ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formik2.touched.name && formik2.errors.name}
              />
              {formik2.touched.name && formik2.errors.name && (
                <Form.Control.Feedback type="invalid">
                  {formik2.errors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formik2.values.email}
                    onChange={formik2.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik2.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik2.errors.email ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik2.touched.email && formik2.errors.email}
                  />
                  {formik2.touched.email && formik2.errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {formik2.errors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter phone"
                    value={formik2.values.phone}
                    onChange={formik2.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik2.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik2.errors.phone ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik2.touched.phone && formik2.errors.phone}
                  />
                  {formik2.touched.phone && formik2.errors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formik2.errors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formik2.values.password}
                    onChange={formik2.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik2.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik2.errors.password ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik2.touched.password && formik2.errors.password}
                  />
                  {formik2.touched.password && formik2.errors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formik2.errors.password}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={formik2.values.address}
                    onChange={formik2.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formik2.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formik2.errors.address ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formik2.touched.address && formik2.errors.address}
                  />
                  {formik2.touched.address && formik2.errors.address && (
                    <Form.Control.Feedback type="invalid">
                      {formik2.errors.address}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setShowAddDriver(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitingDriver}
                className={styles.submitButton}
              >
                {submitingDriver ? "Adding..." : "Add Driver"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal show={isEditingTruckDriver} onHide={() => setIsEditingTruckDriver(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Edit Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikEditDriver.handleSubmit} className={styles.form}>
            <Form.Group className={styles.formGroup}>
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formikEditDriver.values.name}
                onChange={formikEditDriver.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikEditDriver.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formikEditDriver.errors.name ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                isInvalid={formikEditDriver.touched.name && formikEditDriver.errors.name}
              />
              {formikEditDriver.touched.name && formikEditDriver.errors.name && (
                <Form.Control.Feedback type="invalid">
                  {formikEditDriver.errors.name}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formikEditDriver.values.email}
                    onChange={formikEditDriver.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formikEditDriver.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formikEditDriver.errors.email ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formikEditDriver.touched.email && formikEditDriver.errors.email}
                  />
                  {formikEditDriver.touched.email && formikEditDriver.errors.email && (
                    <Form.Control.Feedback type="invalid">
                      {formikEditDriver.errors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formikEditDriver.values.phone}
                    onChange={formikEditDriver.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formikEditDriver.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formikEditDriver.errors.phone ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formikEditDriver.touched.phone && formikEditDriver.errors.phone}
                  />
                  {formikEditDriver.touched.phone && formikEditDriver.errors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formikEditDriver.errors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formikEditDriver.values.address}
                    onChange={formikEditDriver.handleChange}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "#00980DFF";
                      e.target.style.borderWidth = "2px";
                    }}
                    onBlur={(e) => {
                      formikEditDriver.handleBlur(e);
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = formikEditDriver.errors.address ? "red" : "transparent";
                      e.target.style.borderWidth = "1px";
                    }}
                    isInvalid={formikEditDriver.touched.address && formikEditDriver.errors.address}
                  />
                  {formikEditDriver.touched.address && formikEditDriver.errors.address && (
                    <Form.Control.Feedback type="invalid">
                      {formikEditDriver.errors.address}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setIsEditingTruckDriver(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formikEditDriver.isSubmitting}
                className={styles.submitButton}
              >
                {formikEditDriver.isSubmitting ? "Updating..." : "Update Driver"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Notify Modal */}
      <Modal show={modalShowNotify} onHide={() => setModalShowNotify(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Notify User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikNotify.handleSubmit}>
            <Form.Group>
              <Form.Label>Message to {selectedContactUs?.name || "User"}:</Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                rows={3}
                value={formikNotify.values.reason}
                onChange={formikNotify.handleChange}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikNotify.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = formikNotify.errors.reason ? "red" : "transparent";
                  e.target.style.borderWidth = "1px";
                }}
                className={`form-control ${formikNotify.touched.reason && formikNotify.errors.reason ? "is-invalid" : ""}`}
                style={{ height: "100px", resize: "none" }}
              />
              {formikNotify.touched.reason && formikNotify.errors.reason && (
                <div className="text-danger mt-2">{formikNotify.errors.reason}</div>
              )}
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setModalShowNotify(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Notification
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagement;