import React, { useState, useEffect, useRef } from "react";
import useUser from "../../hooks/useUser";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./CommunityEngagementManagement.module.css";
import EditCommunityActivity from "./EditCommunityActivity";

export default function CommunityEngagementManagement() {
  const {
    CommunityActivities,
    addCommunityActivity,
    deleteCommunityActivity,
    deleteSubscribersOfCommunityActivity,
    updateCommunityActivity,
    SubscribersOfCommunityActivities,
    users,
    updateUser,
    addUserNotification,
    addPublicNotification

  } = useUser();

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

  // Yup form validation
  const formik = useFormik({
    initialValues: {
      ActName: "",
      ActDescription: "",
      actIntervalDate: "",
      actstate: "Available",
      imgFile: "",
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
          /^\d{4}-\d{2}-\d{2} - \d{4}-\d{2}-\d{2}$/,
          "Time interval must be in the format YYYY-MM-DD - YYYY-MM-DD"
        )
        .test("is-future", "Time interval must be in the future", function (value) {
          const [start, end] = value.split(" - ").map((date) => new Date(date));
          const today = new Date();
          return start > today && end > today;
        }),
      imgFile: Yup.mixed().required("Activity image is required"),
      NumOfRequiredSubscribers: Yup.number().required(
        "Required subscribers count is required"
      ),
    }),
    onSubmit: (values) => {
      addCommunityActivity(values);
      addPublicNotification({
        notificationContent: `New activity "${values.ActName}" has been added!`,
        notificationDate: new Date().toISOString().split("T")[0],
        isRead: false,
      });
      toast.success("Activity added successfully!");
      setFormVisible(false);
      inputRef.current.value = null;
      formik.resetForm();
    },
  });

  // Handle image change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newProfileImage = reader.result;
        try {
          formik.setFieldValue("imgFile", newProfileImage);
        } catch (error) {
          console.error("Failed to update image:", error);
          toast.error("An error occurred while updating the image.");
        }
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
  };

  const handleCompletedPageChange = (page) => {
    setCompletedCurrentPage(page);
    sessionStorage.setItem("completedCurrentPage", page);
  };

  // Open subscribers modal
  const openSubscribersModal = (activity) => {
    setSelectedActivity(activity);
    setShowSubscribersModal(true);
    setCurrentSubscriberPage(1);
    sessionStorage.setItem("currentSubscriberPage", 1);
  };

  const closeSubscribersModal = () => {
    setShowSubscribersModal(false);
    setSelectedActivity(null);
  };

  // Filter subscribers for selected activity
  const filteredSubscribers = SubscribersOfCommunityActivities.filter(
    (sub) =>
      selectedActivity &&
      sub.ActivityId === selectedActivity.id &&
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubscribers = filteredSubscribers.slice(
    (currentSubscriberPage - 1) * subscriberItemsPerPage,
    currentSubscriberPage * subscriberItemsPerPage
  );

  const handleDeleteSubscriber = (userId) => {
    try {
      const subscriberEntry = SubscribersOfCommunityActivities.find(
        (sub) => sub.userId === userId && sub.ActivityId === selectedActivity.id
      );
      if (!subscriberEntry) {
        toast.error("Subscriber not found!");
        return;
      }
      deleteSubscribersOfCommunityActivity(subscriberEntry.id);
      toast.success("Subscription deleted successfully!");
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      toast.error("Failed to delete subscriber. Please try again.");
    }
  };

  const [handleAcceptAllWaiting, setHandleAcceptAllWaiting] = useState(false);
  const handleAcceptAll = async (ActName) => {
    setHandleAcceptAllWaiting(true);
    const acceptedUsers = users.filter((user) =>
      filteredSubscribers.some((sub) => sub.userId === user.id)
    );
    try {
      for (const user of acceptedUsers) {
        await updateUser(user.id, {
          ...user,
          numOfCompletedActivitiesCount: user.numOfCompletedActivitiesCount + 1,
        });
        await addUserNotification({
          notificationContent: `Activity ${ActName} completed successfully!`,
          notificationDate: new Date().toISOString().split("T")[0],
          isRead: "false",
          userId: user.id,
        });
        // const res = await fetch("http://localhost:5000/community", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     email: user.email,
        //     actName: ActName,
        //     name: user.name,
        //   }),
        // });
        // const data = await res.json();
        // if (!res.ok) {
        //   throw new Error(data.message || "Failed to send email.");
        // }
      }
      for (const sub of filteredSubscribers) {
        await deleteSubscribersOfCommunityActivity(sub.id);
      }
      await deleteCommunityActivity(selectedActivity.id); 
          // Fix pagination if page becomes empty
  const newTotalPages = Math.ceil((completedActivities.length - 1) / activitiesItemsPerPage );
  if ( completedCurrentPage> newTotalPages) {
  const newPage = Math.max(newTotalPages - 1, 1);
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

  const handleSave = (updatedCommunity) => {
    try {
      updateCommunityActivity(updatedCommunity.id, updatedCommunity);
      toast.success("Activity updated successfully!");
      setShowEditCommunity(false);
    } catch (error) {
      toast.error("Failed to update activity. Please try again later.");
    }
  };

  const handledeactivate = async (activity) => {
   deleteCommunityActivity(activity.id)
    // Fix pagination if page becomes empty
  const newTotalPages = Math.ceil((availableActivities.length - 1) / activitiesItemsPerPage );
  if ( availableCurrentPage> newTotalPages) {
  const newPage = Math.max(newTotalPages - 1, 1);
  setAvailableCurrentPage(newPage);
  sessionStorage.setItem("availableCurrentPage", newPage);
  }
}
  // Generate activity objects for available and completed statuses
  const generateActivities = (status) => {
    return (CommunityActivities || [])
      .filter((activity) => {
        if (!activity || !activity.actIntervalDate) return false;
        const [startStr, endStr] = activity.actIntervalDate.split(" - ");
        if (!startStr || !endStr) return false;
        const start = new Date(startStr);
        const end = new Date(endStr);
        const currentDate = new Date();
        return status === "Available" ? currentDate <= end : currentDate > end;
      })
      .map((activity) => ({
        id: activity.id,
        name: activity.ActName,
        description: activity.ActDescription,
        interval: activity.actIntervalDate,
        state: status,
        // Render buttons with consistent style using our CSS classes
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
              onClick={() => {handledeactivate(activity)}}
              className={styles.deleteButton}
            >
              Delete
            </Button>
          </>
        ),
        subscribers: activity.NumOfSubscribers,
        required: activity.NumOfRequiredSubscribers,
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
              <th>Actions</th>
              <th>Subscribers</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAvailableActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.description}</td>
                <td>{activity.interval}</td>
                <td>{activity.state}</td>
                <td>{activity.actions}</td>
                <td>{activity.subscribers}</td>
                <td>{activity.required}</td>
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
                      style={{backgroundColor:availableCurrentPage === i + 1 ? "#2e7d32" : "white",
                        color:availableCurrentPage === i + 1 ? "white" : "black",
                        border:availableCurrentPage === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>  handleAvailablePageChange(i + 1)}
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
              <th>Actions</th>
              <th>Subscribers</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompletedActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{activity.description}</td>
                <td>{activity.interval}</td>
                <td>{activity.state}</td>
                <td>{activity.actions}</td>
                <td>{activity.subscribers}</td>
                <td>{activity.required}</td>
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
                      style={{backgroundColor:completedCurrentPage === i + 1 ? "#2e7d32" : "white",
                        color:completedCurrentPage === i + 1 ? "white" : "black",
                        border:completedCurrentPage === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>  handleCompletedPageChange(i + 1)}
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
            // onFocus={()=>{document.activeElement.blur()}}
                  style={{marginTop: "20px", marginBottom: "20px"}}
                  //onfocus remove outline
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
                    <td>{subscriber.name}</td>
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
                      style={{backgroundColor:currentSubscriberPage === i + 1 ? "#2e7d32" : "white",
                        color:currentSubscriberPage === i + 1 ? "white" : "black",
                        border:currentSubscriberPage === i + 1 ? "#2e7d32" : "white",
                      }}
                      onClick={() =>   handleSubscriberPageChange(i + 1)}
                      className={styles.paginationButton}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
          <Button
            variant="danger"
            className={styles.acceptButton}
            onClick={() => handleAcceptAll(selectedActivity?.ActName)}
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
          placeholder="2025-06-01 - 2025-06-15"
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
          accept="image/*"
          onChange={handleImageChange}
          className={`form-control ${
            formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""
          }`}
        />
        {formik.touched.imgFile && formik.errors.imgFile && (
          <div className="invalid-feedback">{formik.errors.imgFile}</div>
        )}

        {formik.values.imgFile && (
          <div className="mt-2">
            <img
              src={formik.values.imgFile}
              alt="Uploaded"
              className="img-thumbnail"
              width="200"
            />
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
           Add Activity
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
