import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./CommunityEngagementManagement.module.css";
import EditCommunityActivity from "./EditCommunityActivity";
import Cookies from "js-cookie";

// API Service Functions
const getAuthToken = () => {
  return Cookies.get("token");
};

const fetchCommunityActivities = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/CommunityActivities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch activities");
    
    const data = await response.json();
    console.log("Fetched activities:", data);
    return data;
  } catch (error) {
    toast.error(error.message);
    return [];
  }
};

const createCommunityActivity = async (activity) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    
    formData.append("actName", activity.ActName);
    formData.append("actDescription", activity.ActDescription);
    formData.append("actIntervalDate", activity.actIntervalDate);
    formData.append("actState", activity.actstate);
    formData.append("numOfSubscribers", activity.NumOfSubscribers);
    formData.append("numOfRequiredSubscribers", activity.NumOfRequiredSubscribers);
    
    // Handle the image file properly
    if (activity.imgFile && activity.imgFile.file) {
      formData.append("photo", activity.imgFile.file);  // Append the actual File object
    } else if (typeof activity.imgFile === 'string') {
      // Handle case where it might be a string (fallback)
      formData.append("photo", activity.imgFile);
    }

    const response = await fetch(`/api/CommunityActivities`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create activity: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Create activity error:", error);
    throw error;
  }
};
// Updated updateCommunityActivity function
const updateCommunityActivity = async (id, activity) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    
    // Use backend-compatible property names
    formData.append("actName", activity.actName);
    formData.append("actDescription", activity.actDescription);
    formData.append("actIntervalDate", activity.actIntervalDate);
    formData.append("actState", activity.actState);
    formData.append("numOfSubscribers", activity.numOfSubscribers);
    formData.append("numOfRequiredSubscribers", activity.numOfRequiredSubscribers);
    
    if (activity.photo && activity.photo.startsWith("data:image")) {
      formData.append("photo", activity.photo);
    }

    const response = await fetch(`/api/CommunityActivities/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      // Return the original activity if backend returns empty response
      return activity;
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Received invalid JSON from server");
    }
  } catch (error) {
    console.error("Update activity error:", error);
    toast.error(error.message || "Failed to update activity");
    throw error;
  }
};

const deleteCommunityActivity = async (id) => {
  try {
    const token = getAuthToken();
    await fetch(`/api/CommunityActivities/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE"
    });
    return true;
  } catch (error) {
    toast.error("Failed to delete activity");
    return false;
  }
};

const fetchSubscribers = async (activityId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `/api/CommunityActivities/${activityId}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return await response.json();
  } catch (error) {
    toast.error("Failed to fetch subscribers");
    return [];
  }
};

const deleteSubscription = async (activityId, userId) => {
  try {
    const token = getAuthToken();
    await fetch(
      `/api/CommunityActivities/${activityId}/DeletesSubscripers?uid=${userId}`,
      { 
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        } 
      }
    );
    return true;
  } catch (error) {
    toast.error("Failed to delete subscription");
    return false;
  }
};

const completeActivity = async (activityId) => {
  try {
    const token = getAuthToken();
    await fetch(
      `/api/CommunityActivities/${activityId}/complete-activity`,
      { 
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return true;
  } catch (error) {
    toast.error("Failed to complete activity");
    return false;
  }
};

const addPublicNotification = async (content) => {
  try {
    const token = getAuthToken();
    await fetch(`/api/PublicNotifications`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",  
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        notificationContent: content,
        notificationDate: new Date().toISOString().split("T")[0]
      })
    });
  } catch (error) {
    console.error("Failed to add public notification:", error);
  }
};

const addUserNotification = async (userId, content) => {
  try {
    const token = getAuthToken();
    await fetch(`/api/UserNotifications?id=${userId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",  
        Authorization: `Bearer ${token}`  
      },
      body: JSON.stringify({
        notificationContent: content,
        notificationDate: new Date().toISOString().split("T")[0],
        isRead: false
      })
    });
  } catch (error) {
    console.error("Failed to add user notification:", error);
  }
};

export default function CommunityEngagementManagement() {
  const [communityActivities, setCommunityActivities] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribers Modal Pagination
  const [currentSubscriberPage, setCurrentSubscriberPage] = useState(
    parseInt(sessionStorage.getItem("currentSubscriberPage")) || 1
  );
  const subscriberItemsPerPage = 5;

  // Activities Pagination for Available and Completed Activities
  const [availableCurrentPage, setAvailableCurrentPage] = useState(
    parseInt(sessionStorage.getItem("availableCurrentPage")) || 1
  );
  const [completedCurrentPage, setCompletedCurrentPage] = useState(
    parseInt(sessionStorage.getItem("completedCurrentPage")) || 1
  );
  const activitiesItemsPerPage = 5;

  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const inputRef = useRef();
  const [handleAcceptAllWaiting, setHandleAcceptAllWaiting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const activities = await fetchCommunityActivities();
        setCommunityActivities(activities);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load data");
        setLoading(false);
      }
    };
    loadData();
  }, []);
const convertDMYToYMD = ( dmyString='') => {
  if (!dmyString) return "";
  const parts = dmyString.split(" - ");
  if (parts.length !== 2) return dmyString;

  const convertPart = (dmy) => {
    const [day, month, year] = dmy.split("/");
    return `${year}-${month}-${day}`;
  };

  return `${convertPart(parts[0])} - ${convertPart(parts[1])}`;
};const convertYMDToDMY = (ymdString) => {
  if (!ymdString) return "";
  const parts = ymdString.split(" - ");
  if (parts.length !== 2) return ymdString;

  const convertPart = (ymd) => {
    const [year, month, day] = ymd.split("-");
    return `${day}/${month}/${year}`;
  };

  return `${convertPart(parts[0])} - ${convertPart(parts[1])}`;
};

  // Yup form validation
  const formik = useFormik({
 initialValues: {
    ActName: "",
    ActDescription: "",
    actIntervalDate: "",
    actstate: "Available",
    imgFile: null,  // Initialize as null
    NumOfSubscribers: 0,
    NumOfRequiredSubscribers: "",
  },
    validationSchema: Yup.object({
      ActName: Yup.string().required("Activity name is required"),
      ActDescription: Yup.string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters"),
       actIntervalDate: Yup.string()
      .required("Time interval is required")
      .matches(
        /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/,
        "Time interval must be in the format DD/MM/YYYY - DD/MM/YYYY"
      )
      .test("is-future", "Time interval must be in the future", function (value) {
        if (!value) return false;
        
        const [startStr, endStr] = value.split(" - ");
        if (!startStr || !endStr) return false;
        
        // Convert DD/MM/YYYY to Date object
        const convertToDate = (dmy) => {
          const [day, month, year] = dmy.split('/');
          return new Date(`${year}-${month}-${day}`);
        };
        
        const start = convertToDate(startStr);
        const end = convertToDate(endStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return start > today && end > today;
      }),
      imgFile: Yup.mixed().required("Activity image is required"),
      NumOfRequiredSubscribers: Yup.number().required(
        "Required subscribers count is required"
      ),
    }),
    onSubmit: async (values) => {
    try {
      const newActivity = await createCommunityActivity(values);
      setCommunityActivities(prev => [...prev, newActivity]);
      await addPublicNotification(`New activity "${values.ActName}" has been added!`);
      toast.success("Activity added successfully!");
      setFormVisible(false);
      inputRef.current.value = null;
      formik.resetForm();
    } catch (error) {
      toast.error(error.message || "Failed to add activity");
    }
  },
});

  // Handle image change
const handleImageChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Store both the file object and preview URL
      formik.setFieldValue("imgFile", {
        file: file,          // Store the file object
        preview: reader.result  // Base64 string for preview
      });
    };
    reader.readAsDataURL(file);
  }
};

  // Pagination handlers
  const handleSubscriberPageChange = (page) => {
    setCurrentSubscriberPage(page);
    sessionStorage.setItem("currentSubscriberPage", page);
  };

  const handleAvailablePageChange = (page) => {
    setAvailableCurrentPage(page);
    sessionStorage.setItem("availableCurrentPage", page);
      window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  const handleCompletedPageChange = (page) => {
    setCompletedCurrentPage(page);
    sessionStorage.setItem("completedCurrentPage", page);
      window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  // Open subscribers modal
const openSubscribersModal = async (activity) => {
  // Get the latest version of the activity from state
  const latestActivity = communityActivities.find(a => a.id === activity.id) || activity;
  setSelectedActivity(latestActivity);
  
  try {
    const subs = await fetchSubscribers(latestActivity.id);
    setSubscribers(subs);
    setShowSubscribersModal(true);
    setCurrentSubscriberPage(1);
    sessionStorage.setItem("currentSubscriberPage", 1);
  } catch (error) {
    toast.error("Failed to load subscribers");
  }
};

  const closeSubscribersModal = () => {
    setShowSubscribersModal(false);
    setSelectedActivity(null);
  };

  // Filter subscribers for selected activity
  const filteredSubscribers = subscribers.filter(
    (sub) =>
      selectedActivity &&
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubscribers = filteredSubscribers.slice(
    (currentSubscriberPage - 1) * subscriberItemsPerPage,
    currentSubscriberPage * subscriberItemsPerPage
  );

const handleDeleteSubscriber = async (userId) => {
  try {
    await deleteSubscription(selectedActivity.id, userId);
    
    // Update subscribers state
    setSubscribers(prev => prev.filter(sub => sub.userId !== userId));
    
    // Update community activities state
    setCommunityActivities(prev => 
      prev.map(activity => {
        if (activity.id === selectedActivity.id) {
          return {
            ...activity,
            numOfSubscribers: activity.numOfSubscribers - 1
          };
        }
        return activity;
      })
    );
    
    toast.success("Subscription deleted successfully!");
  } catch (error) {
    toast.error("Failed to delete subscription");
  }
};

  const handleAcceptAll = async (actName) => {
    setHandleAcceptAllWaiting(true);
    try {
      await completeActivity(selectedActivity.id);
      
      // Send notifications to subscribers
      filteredSubscribers.forEach(sub => {
        addUserNotification(
          sub.userId,
          `Activity ${actName} completed successfully!`
        );
      });

      // Update local state
      setCommunityActivities(prev => 
        prev.filter(activity => activity.id !== selectedActivity.id)
      );
      
      // Fix pagination if page becomes empty
      const newTotalPages = Math.ceil((completedActivities.length - 1) / activitiesItemsPerPage );
      if (completedCurrentPage > newTotalPages) {
        const newPage = Math.max(newTotalPages, 1);
        setCompletedCurrentPage(newPage);
        sessionStorage.setItem("completedCurrentPage", newPage); 
      }
      
      setSelectedActivity(null);
      toast.success("All subscribers accepted successfully!");
      closeSubscribersModal();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while accepting subscribers.");
    } finally {
      setHandleAcceptAllWaiting(false);
    }
  };

  const handleEdit = (activity) => {
    setSelectedCommunity(activity);
    setShowEditCommunity(true);
  };

  const handleSave = async (updatedCommunity) => {
    try {
      const updatedActivity = await updateCommunityActivity(
        updatedCommunity.id,
        updatedCommunity
      );
      
      setCommunityActivities(prev =>
        prev.map(activity => 
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      
      toast.success("Activity updated successfully!");
      setShowEditCommunity(false);
    } catch (error) {
      toast.error("Failed to update activity. Please try again later.");
    }
  };

  const handledeactivate = async (activity) => {
    try {
      await deleteCommunityActivity(activity.id);
      setCommunityActivities(prev => 
        prev.filter(a => a.id !== activity.id)
      );
      
      // Fix pagination if page becomes empty
      const newTotalPages = Math.ceil((availableActivities.length - 1) / activitiesItemsPerPage );
      if (availableCurrentPage > newTotalPages) {
        const newPage = Math.max(newTotalPages, 1);
        setAvailableCurrentPage(newPage);
        sessionStorage.setItem("availableCurrentPage", newPage);
      }
      
      toast.success("Activity deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete activity");
    }
  };

  // Generate activity objects for available and completed statuses
  const generateActivities = (status) => {
    return (communityActivities || [])
      .filter((activity) => {
        if (!activity || !activity.actIntervalDate) return false;
        
        // Handle date format - backend returns "01/09/2025 - 15/09/2025"
        const [startStr, endStr] = activity.actIntervalDate.split(" - ");
        if (!startStr || !endStr) return false;
        
        // Parse dates correctly (DD/MM/YYYY format)
        const [startDay, startMonth, startYear] = startStr.split("/");
        const [endDay, endMonth, endYear] = endStr.split("/");
        
        const start = new Date(`${startYear}-${startMonth}-${startDay}`);
        const end = new Date(`${endYear}-${endMonth}-${endDay}`);
        const currentDate = new Date();
        
        return status === "Available" 
          ? currentDate <= end 
          : currentDate > end;
      })
      .map((activity) => ({
        id: activity.id,
        name: activity.actName,
        description: activity.actDescription,
        interval: activity.actIntervalDate,
        state: activity.actState,
        actions: (
          <>
            {status === "Completed" && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => openSubscribersModal(activity)}
                className={styles.viewButton}
              >
                View Subscribers
              </Button>
            )}
            {status === "Available" && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleEdit(activity)}
                className={styles.editButton}
              >
                Edit
              </Button>
            )}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handledeactivate(activity)}
              className={styles.deleteButton}
            >
              Delete
            </Button>
          </>
        ),
        subscribers: activity.numOfSubscribers,
        required: activity.numOfRequiredSubscribers,
      }));
  };

  // Pagination for available activities
  const availableActivities = generateActivities("Available");
  const paginatedAvailableActivities = availableActivities.slice(
    (availableCurrentPage - 1) * activitiesItemsPerPage,
    availableCurrentPage * activitiesItemsPerPage
  );
  const totalAvailablePages = Math.ceil(
    availableActivities.length / activitiesItemsPerPage
  );

  // Pagination for completed activities
  const completedActivities = generateActivities("Completed");
  const paginatedCompletedActivities = completedActivities.slice(
    (completedCurrentPage - 1) * activitiesItemsPerPage,
    completedCurrentPage * activitiesItemsPerPage
  );
  const totalCompletedPages = Math.ceil(
    completedActivities.length / activitiesItemsPerPage
  );

  if (loading) return <div>Loading activities...</div>;

  return (
    <div className={styles.container}>
      <h2>Social Events Management</h2>

      {/* Available Activities Table */}
      <h3>Available Social Activities</h3>
      <div className={styles.tableWrapper}>
        <Table striped bordered hover responsive className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th style={{width: "13%"}}>Activity Name</th>
              <th>Description</th>
              <th style={{width: "12%"}}>Time Interval</th>
              <th>Status</th>
              
              <th>Subscribers</th>
              <th>Required</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAvailableActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.description}</td>
                <td>{activity.interval}</td>
                <td>{activity.state}</td>
                
                <td>{activity.subscribers}</td>
                <td>{activity.required}</td><td>{activity.actions}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className={styles.paginationContainer}>
        <div>
          {Array.from({ length: totalAvailablePages }, (_, i) => (
            <Button
              key={i + 1}
              variant={availableCurrentPage === i + 1 ? "primary" : "light"}
              style={{
                backgroundColor: availableCurrentPage === i + 1 ? "#2e7d32" : "white",
                color: availableCurrentPage === i + 1 ? "white" : "black",
                border: availableCurrentPage === i + 1 ? "1px solid #2e7d32" : "1px solid #dee2e6",
              }}
              onClick={() => handleAvailablePageChange(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{fontWeight: "bold"}}>Available Activities: {availableActivities.length}</p>
      </div>

      {/* Completed Activities Table */}
      <h3 style={{marginTop: "40px"}}>Completed Social Activities</h3>
      <div className={styles.tableWrapper}>
        <Table striped bordered hover responsive className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th style={{width: "13%"}}>Activity Name</th>
              <th>Description</th>
              <th style={{width: "12%"}}>Time Interval</th>
              <th>Status</th>
              
              <th>Subscribers</th>
              <th>Required</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompletedActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.description}</td>
                <td>{activity.interval}</td>
                <td>Completed</td>
               
                <td>{activity.subscribers}</td>
                <td>{activity.required}</td> <td>{activity.actions}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className={styles.paginationContainer}>
        <div>
          {Array.from({ length: totalCompletedPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={completedCurrentPage === i + 1 ? "primary" : "light"}
              style={{
                backgroundColor: completedCurrentPage === i + 1 ? "#2e7d32" : "white",
                color: completedCurrentPage === i + 1 ? "white" : "black",
                border: completedCurrentPage === i + 1 ? "1px solid #2e7d32" : "1px solid #dee2e6",
              }}
              onClick={() => handleCompletedPageChange(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{fontWeight: "bold"}}>Completed Activities: {completedActivities.length}</p>
      </div>

      {/* Subscribers Modal */}
      <Modal show={showSubscribersModal} onHide={closeSubscribersModal} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Subscribers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search Subscriber"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            style={{marginTop: "20px", marginBottom: "20px"}}
            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#ced4da";
            }}
          />
          <div className={styles.tableWrapper}>
            <Table striped bordered hover responsive className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.userName}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber.userId)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div>
            {Array.from({ length: Math.ceil(filteredSubscribers.length / subscriberItemsPerPage) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentSubscriberPage === i + 1 ? "primary" : "light"}
                style={{
                  backgroundColor: currentSubscriberPage === i + 1 ? "#2e7d32" : "white",
                  color: currentSubscriberPage === i + 1 ? "white" : "black",
                  border: currentSubscriberPage === i + 1 ? "1px solid #2e7d32" : "1px solid #dee2e6",
                }}
                onClick={() => handleSubscriberPageChange(i + 1)}
                className={styles.paginationButton}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="danger"
            className={styles.acceptButton}
            onClick={() => handleAcceptAll(selectedActivity?.actName)}
            disabled={handleAcceptAllWaiting || filteredSubscribers.length === 0}
          >
            {handleAcceptAllWaiting ? "Accepting..." : "Accept All Subscribers"}
          </Button>
        </Modal.Body>
      </Modal>

      {/* Add New Activity Form */}
      <h2 style={{marginTop: "40px"}}>➕ Add New Activity</h2>
      <form onSubmit={formik.handleSubmit} className={styles.activityForm} >
        <label htmlFor="ActName">📌 Activity Name:</label>
        <input
          type="text"
          id="ActName"
          name="ActName"
          placeholder="Enter activity name"
          value={formik.values.ActName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${
            formik.touched.ActName && formik.errors.ActName ? "is-invalid" : ""
          }`}
        />
        {formik.touched.ActName && formik.errors.ActName && (
          <div className="invalid-feedback">{formik.errors.ActName}</div>
        )}

        <label htmlFor="ActDescription">📄 Activity Description:</label>
        <textarea
          id="ActDescription"
          name="ActDescription"
          placeholder="Enter activity description"
          value={formik.values.ActDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${
            formik.touched.ActDescription && formik.errors.ActDescription
              ? "is-invalid"
              : ""
          }`}
          style={{ height: "100px", resize: "none" }}
        />
        {formik.touched.ActDescription && formik.errors.ActDescription && (
          <div className="invalid-feedback">{formik.errors.ActDescription}</div>
        )}

        <label htmlFor="actIntervalDate">📅 Time Interval:</label>
        <input
          type="text"
          id="actIntervalDate"
          name="actIntervalDate"
          placeholder="DD/MM/YYYY - DD/MM/YYYY"
          value={formik.values.actIntervalDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${
            formik.touched.actIntervalDate && formik.errors.actIntervalDate
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.actIntervalDate && formik.errors.actIntervalDate && (
          <div className="invalid-feedback">{formik.errors.actIntervalDate}</div>
        )}

        <label htmlFor="NumOfRequiredSubscribers">
          📋 Required Subscribers Count:
        </label>
        <input
          type="number"
          id="NumOfRequiredSubscribers"
          name="NumOfRequiredSubscribers"
          value={formik.values.NumOfRequiredSubscribers}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${
            formik.touched.NumOfRequiredSubscribers &&
            formik.errors.NumOfRequiredSubscribers
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.NumOfRequiredSubscribers &&
          formik.errors.NumOfRequiredSubscribers && (
            <div className="invalid-feedback">
              {formik.errors.NumOfRequiredSubscribers}
            </div>
          )}

    <label htmlFor="imgFile">🖼️ Activity Image:</label>
<input
  type="file"
  id="imgFile"
  name="imgFile"
  ref={inputRef}
  accept="image/jpeg, image/png"
  onChange={handleImageChange}
  className={`form-control ${
    formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""
  }`}
/>
{formik.touched.imgFile && formik.errors.imgFile && (
  <div className="invalid-feedback">{formik.errors.imgFile}</div>
)}

{formik.values.imgFile?.preview && (
  <div className="mt-2">
    <img
      src={formik.values.imgFile.preview}
      alt="Uploaded preview"
      className="img-thumbnail"
      width="200"
      style={{ background: "#1bad1d" }}
    />
  </div>
)}
        <button type="submit" className={`${styles.submitButton} ${formik.isSubmitting ? styles.disabled : ""}`} disabled={formik.isSubmitting}>
           {formik.isSubmitting ? "Adding..." : "Add Activity"}
        </button>
      </form>

      {showEditCommunity && selectedCommunity && (
        <EditCommunityActivity
          activity={selectedCommunity}
          onClose={() => setShowEditCommunity(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}