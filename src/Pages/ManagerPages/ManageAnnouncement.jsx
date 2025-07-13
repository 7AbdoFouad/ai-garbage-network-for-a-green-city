import React, { useEffect, useState, useMemo } from "react";
import { Button, Table, Modal, Form, Tab, Tabs } from "react-bootstrap";
import { string, object } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import styles from "./ManageAnnouncement.module.css";

// API base URL
const API_BASE_URL = "https://greencityapi.runasp.net";

// Helper function to get auth token
const getAuthToken = () => {
  return Cookies.get("token");
};

// Yup schemas
const rejectSchema = object().shape({
  reason: string()
    // .required("Rejection reason is required")
    // .min(10, "Message is too short"),
});

const notifySchema = object().shape({
  reason: string()
    .required("Reply is required")
    .min(10, "Message is too short"),
});

export default function ManageAnnouncement() {
  // State for data
  const [publicAnnouncements, setPublicAnnouncements] = useState([]);
  const [paidAnnouncements, setPaidAnnouncements] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [regions, setRegions] = useState([]);
  
  // Loading states
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(true);
  
  // UI state
const getInitialTab = () => {
  return sessionStorage.getItem("activeTab2") || "public";
};

const [activeTab2, setactiveTab2] = useState(getInitialTab());

// Save tab to sessionStorage when it changes
useEffect(() => {
  sessionStorage.setItem("activeTab2", activeTab2);
}, [activeTab2]);  
const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterContactUsByDate, setFilterContactUsByDate] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedContactUs, setSelectedContactUs] = useState(null);
  const [selectedPaidAnnouncement, setSelectedPaidAnnouncement] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalShowNotify, setModalShowNotify] = useState(false);
  const [modalShowRejectPaid, setModalShowRejectPaid] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  const [currentPageContact, setCurrentPageContact] = useState(1);
  const contactsPerPage = 5;
  const [currentPagePaid, setCurrentPagePaid] = useState(1);
  const paidPerPage = 5;

  // Fetch data helper function
// utils/api.js
 const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  } else {
    return await response.text();
  }
};


  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public announcements
        const publicData = await fetchWithAuth(`/api/UsersAnnouncements`);
        setPublicAnnouncements(publicData);
        setLoadingPublic(false);
        
        // Fetch paid announcements
        const paidData = await fetchWithAuth(`/api/PaidUserAnnouncements/admin/pending-announcements`);
        setPaidAnnouncements(paidData);
        setLoadingPaid(false);
        
        // Fetch contact messages
        const contactData = await fetchWithAuth(`/api/ContactUs`);
        setContactMessages(contactData);
        setLoadingContact(false);
        
        // Fetch regions
        const regionsData = await fetchWithAuth(`/api/Regions`);
        setRegions(regionsData);
        setLoadingRegions(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        
        // Ensure loading states are reset even on error
        setLoadingPublic(false);
        setLoadingPaid(false);
        setLoadingContact(false);
        setLoadingRegions(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter public announcements for pending status with safe access
  const pendingPublicAnnouncements = useMemo(() => {
    return (publicAnnouncements || []).filter(ann => ann.status === "Pending");
  }, [publicAnnouncements]);

  // Filter paid announcements for pending status with safe access
  const pendingPaidAnnouncements = useMemo(() => {
    return (paidAnnouncements || []).filter(ann => ann.status === "Pending");
  }, [paidAnnouncements]);

  // Dummy NLP function to analyze report description and return a priority level
  const analyzePriority = (report) => {
    const text = (report.announcementDescription || "").toLowerCase();
    const highPriorityKeywords = [
      "urgent", "immediately", "danger", "critical", "emergency",
      "life-threatening", "hazard", "leak", "explosion", "fire",
      "toxic", "severe", "biohazard", "gas", "injury", "collapse"
    ];
    const mediumPriorityKeywords = [
      "notice", "soon", "warning", "attention", "delay",
      "repair needed", "damaged", "malfunction", "issue", "problem",
      "not working", "maintenance", "breakdown", "missing"
    ];
    
    const containsKeyword = (keywords) => 
      keywords.some(keyword => text.includes(keyword));

    if (containsKeyword(highPriorityKeywords)) return "high";
    if (containsKeyword(mediumPriorityKeywords)) return "medium";
    if (text === "none") return "unknown";
    return "low";
  };

  // Handle public announcement acceptance
  const handleAcceptPublic = async (report) => {
    try {
      console.log("Accepting report:", report);
      
      // Approve the announcement
      await fetchWithAuth(`/api/UsersAnnouncements/approve/${report.id}`, {
        method: "PUT"
      });
 
  // const res2= await fetch("/api/Users", {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${getAuthToken()}`,
  //         "Content-Type": "application/json"
  //       }
  //     });
            // const allusers = await res2.json();
            // const user = allusers.find((user) => user.email === report.email);
            // const userId = user ? user.id : null;

            //  const formData = new FormData();     
            //  formData.append("notificationContent", `✅ Your  announcement for  ${report.announcementType} has been approved`);
            //  formData.append("notificationDate", new Date().toISOString().split("T")[0]);
          // Send notification to user
          // await fetchWithAuth(`/api/Notifications/User/${userId}`, {
          //   method: "POST",
          //   body: formData
          // });
      toast.success("Report accepted successfully");
      
      // Update local state by removing the approved announcement
      setPublicAnnouncements(publicAnnouncements.filter(a => a.id !== report.id));
    } catch (error) {
      console.error("Failed to accept report:", error);
      toast.error("Failed to accept report");
    }
  };

  // Handle public announcement rejection
  const handleRejectPublic = async (report) => {
    // setSelectedReport(report);
    // setModalShow(true);
       try {
          // Reject the public announcement
          await fetchWithAuth(`/api/UsersAnnouncements/reject/${report.id}`, {
            method: "POST",
          });
      //  const res2= await fetch("/api/Users", {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${getAuthToken()}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      //       const allusers = await res2.json();
      //       const user = allusers.find((user) => user.email === selectedReport.email);
      //       const userId = user ? user.id : null;

      //        const formData = new FormData();     
      //        formData.append("notificationContent", `❌ Your  announcement for  ${selectedReport.announcementType} has been rejected. 
      //        ${values.reason ? `Reason: ${values.reason}` : ""}`);
      //        formData.append("notificationDate", new Date().toISOString().split("T")[0]);
      //     // Send notification to user
      //     await fetchWithAuth(`/api/Notifications/User/${userId}`, {
      //       method: "POST",
      //       body: formData
      //     });
          
          toast.success("Rejection sent successfully");
          
          // Update local state by removing the rejected announcement
          setPublicAnnouncements(publicAnnouncements.filter(a => a.id !== report.id));
          
          // setModalShow(false);
          // setSelectedReport(null);
          // formikReject.resetForm();
        } catch (error) {
          console.error("Failed to reject report:", error);
          toast.error("Failed to reject report");
        }

  };

  // Handle paid announcement acceptance
  const handleAcceptPaid = async (announcement) => {
    try {
      // Approve the paid announcement
      await fetchWithAuth(`/api/PaidUserAnnouncements/approve/${announcement.id}`, {
        method: "POST"
      });
    // const formData = new FormData();     
    // formData.append("notificationContent", `Paid announcement approved: ${announcement.institutionName}`);
    // formData.append("notificationDate", new Date().toISOString().split("T")[0]);
    //   // Send notification to user
    //   await fetchWithAuth(`/api/Notifications/User/${announcement.userId}`, {
    //     method: "POST",
    //     body: formData
    //   });
      toast.success("Paid announcement approved successfully");
      
      // Update local state by removing the approved announcement
      setPaidAnnouncements(paidAnnouncements.filter(a => a.id !== announcement.id));
    } catch (error) {
      console.error("Failed to approve paid announcement:", error);
      toast.error("Failed to approve paid announcement");
    }
  };

  // Handle paid announcement rejection
  const handleRejectPaid = (announcement) => {
    setSelectedPaidAnnouncement(announcement);
    setModalShowRejectPaid(true);
  };

  // Handle contact us notification
  const handleNotify = (report) => {
    setSelectedContactUs(report);
    setModalShowNotify(true);
  };

  // Filter reports using useMemo for performance with safe access
  const filteredReports = useMemo(() => {
    let reports = pendingPublicAnnouncements || [];
    if (filterType) {
      reports = reports.filter(r => r.announcementType === filterType);
    }
    if (filterRegion) {
      reports = reports.filter(r => r.regionName === filterRegion);
    }
    if (filterPriority) {
      reports = reports.filter(r => analyzePriority(r) === filterPriority);
    }
    if (filterDate === "newest") {
      reports = [...reports].sort(
        (a, b) => new Date(b.todayDate) - new Date(a.todayDate)
      );
    } else if (filterDate === "oldest") {
      reports = [...reports].sort(
        (a, b) => new Date(a.todayDate) - new Date(b.todayDate)
      );
    }
    return reports;
  }, [pendingPublicAnnouncements, filterType, filterRegion, filterPriority, filterDate]);

  // Filter and sort contact us messages with safe access
  const filteredContactUs = useMemo(() => {
    let contacts = contactMessages || [];
    if (filterContactUsByDate === "newest") {
      contacts = [...contacts].sort(
        (a, b) => new Date(b.todayDate) - new Date(a.todayDate)
      );
    } else if (filterContactUsByDate === "oldest") {
      contacts = [...contacts].sort(
        (a, b) => new Date(a.todayDate) - new Date(b.todayDate)
      );
    }
    return contacts;
  }, [contactMessages, filterContactUsByDate]);

  // Pagination logic for public announcements
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination logic for contact us
  const indexOfLastContact = currentPageContact * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContactUs.slice(indexOfFirstContact, indexOfLastContact);
  const totalPagesContact = Math.ceil(filteredContactUs.length / contactsPerPage);

  const paginateContact = (pageNumber) => setCurrentPageContact(pageNumber);

  // Pagination logic for paid announcements
  const indexOfLastPaid = currentPagePaid * paidPerPage;
  const indexOfFirstPaid = indexOfLastPaid - paidPerPage;
  const currentPaid = pendingPaidAnnouncements.slice(indexOfFirstPaid, indexOfLastPaid);
  const totalPagesPaid = Math.ceil(pendingPaidAnnouncements.length / paidPerPage);

  const paginatePaid = (pageNumber) => setCurrentPagePaid(pageNumber);

  // Formik for public reject modal
  const formikReject = useFormik({
    initialValues: { reason: "" },
    validationSchema: rejectSchema,
    onSubmit: async (values) => {
      if (selectedReport) {
        try {
          // Reject the public announcement
          await fetchWithAuth(`/api/UsersAnnouncements/reject/${selectedReport.id}`, {
            method: "POST",
          });
      //  const res2= await fetch("/api/Users", {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${getAuthToken()}`,
      //     "Content-Type": "application/json"
      //   }
      // });
      //       const allusers = await res2.json();
      //       const user = allusers.find((user) => user.email === selectedReport.email);
      //       const userId = user ? user.id : null;

      //        const formData = new FormData();     
      //        formData.append("notificationContent", `❌ Your  announcement for  ${selectedReport.announcementType} has been rejected. 
      //        ${values.reason ? `Reason: ${values.reason}` : ""}`);
      //        formData.append("notificationDate", new Date().toISOString().split("T")[0]);
      //     // Send notification to user
      //     await fetchWithAuth(`/api/Notifications/User/${userId}`, {
      //       method: "POST",
      //       body: formData
      //     });
          
          toast.success("Rejection sent successfully");
          
          // Update local state by removing the rejected announcement
          setPublicAnnouncements(publicAnnouncements.filter(a => a.id !== selectedReport.id));
          
          setModalShow(false);
          setSelectedReport(null);
          formikReject.resetForm();
        } catch (error) {
          console.error("Failed to reject report:", error);
          toast.error("Failed to reject report");
        }
      }
    },
  });

  // Formik for contact us notify modal
  const formikNotify = useFormik({
    initialValues: { reason: "" },
    validationSchema: notifySchema,
    onSubmit: async (values) => {
      console.log( values);
      
      if (selectedContactUs) {
        try {
          // Delete the contact message
          await fetchWithAuth(`/api/ContactUs/${selectedContactUs.id}`, {
            method: "DELETE"
          });
                const res2= await fetch("/api/Users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json"
        }
      });
            const allusers = await res2.json();
                const user = allusers.find((user) => user.email === selectedContactUs.email);
      const userId = user ? user.id : null;
          // Send notification to user
           const formData = new FormData();     
    formData.append("notificationContent", `Reply: ${selectedContactUs.message} - ${values.reason}`);
    formData.append("notificationDate", new Date().toISOString().split("T")[0]);
          await fetchWithAuth(`/api/Notifications/User/${userId}`, {
            method: "POST",
            body: formData
          });
          toast.success("Reply sent successfully");
          
          // Update local state by removing the replied message
          setContactMessages(contactMessages.filter(m => m.id !== selectedContactUs.id));
          
          setModalShowNotify(false);
          setSelectedContactUs(null);
          formikNotify.resetForm();
        } catch (error) {
          console.error("Failed to send reply:", error);
          toast.error("Failed to send reply");
        }
      }
    },
  });

  // Formik for paid reject modal
  const formikRejectPaid = useFormik({
    initialValues: { reason: "" },
    validationSchema: rejectSchema,
    onSubmit: async (values) => {
      if (selectedPaidAnnouncement) {
        try {
          // Reject the paid announcement
          await fetchWithAuth(`/api/PaidUserAnnouncements/reject/${selectedPaidAnnouncement.id}`, {
            method: "POST"
          });
//                      const formData = new FormData();     
//  formData.append("notificationContent", `❌ Your paid announcement for  ${selectedPaidAnnouncement.institutionName} has been rejected. 
//   Reason: ${values.reason}.`);
//     formData.append("notificationDate", new Date().toISOString().split("T")[0]);
//           // Send notification to user
//           await fetchWithAuth(`/api/Notifications/User/${selectedPaidAnnouncement.userId}`, {
//             method: "POST",
//             body: formData
//           });
          
          toast.success("Rejection sent successfully");
          
          // Update local state by removing the rejected announcement
          setPaidAnnouncements(paidAnnouncements.filter(a => a.id !== selectedPaidAnnouncement.id));
          
          setModalShowRejectPaid(false);
          setSelectedPaidAnnouncement(null);
          formikRejectPaid.resetForm();
        } catch (error) {
          console.error("Failed to reject paid announcement:", error);
          toast.error("Failed to reject paid announcement");
        }
      }
    },
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Manage Announcements</h2>
      
   <Tabs
      activeKey={activeTab2}
      onSelect={(k) => setactiveTab2(k)}
      className={`mb-3 ${styles.customTabs}`}
      variant="tabs"           /* default bootstrap tabs */
      mountOnEnter
      unmountOnExit
    >
        <Tab eventKey="public" title="Public Announcements" defaultChecked >
          <div className="mt-4">
            <h3 className={styles.subHeader}>User Reports</h3>
            
            {/* FILTERS for User Reports */}
            <div className={styles.filterGrid}>
              <div className={styles.filterBlock}>
                <label className={styles.filterLabel} style={{marginLeft:"5px",marginBottom:"5px"}}>Report Type</label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.filterSelect}
                  style={{maxWidth: "200px"}}
                >
                  <option value="">All Report Types</option>
                  <option value="Full Bin">Full Bin</option>
                  <option value="damaged bin">Damaged Bin</option>
                  <option value="Scattered Waste">Scattered Waste</option>
                  <option value="Hazardous Garbage">Hazardous Garbage</option>
                  <option value="Waste Not Collected">Waste Not Collected</option>
                </Form.Select>
              </div>

              <div className={styles.filterBlock}>
                <label className={styles.filterLabel} style={{marginLeft:"5px",marginBottom:"5px"}}>Date Order</label>
                <Form.Select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={styles.filterSelect}
                  style={{maxWidth: "200px"}}
                >
                  <option value="">Select Date Order</option>
                  <option value="oldest">Oldest to Newest</option>
                  <option value="newest">Newest to Oldest</option>
                </Form.Select>
              </div>

              <div className={styles.filterBlock}>
                <label className={styles.filterLabel} style={{marginLeft:"5px",marginBottom:"5px"}}>Region</label>
                <Form.Select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className={styles.filterSelect}
                  style={{maxWidth: "200px"}}
                >
                  <option value="">All Regions</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.regionName}>
                      {region.regionName}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className={styles.filterBlock}>
                <label className={styles.filterLabel} style={{marginLeft:"5px",marginBottom:"5px"}}>Priority</label>
                <Form.Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={styles.filterSelect}
                  style={{maxWidth: "200px"}}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="unknown">Unknown</option>
                </Form.Select>
              </div>
            </div>

            {/* TABLE for User Reports */}
            <div className={styles.tableWrapper}>
              <Table striped bordered hover responsive className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>User</th>
                    <th>Message</th>
                    <th>Location</th>
                    <th>BinNumber</th>
                    <th>Region</th>
                    <th>Priority</th>
                    <th>Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPublic ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentReports.length > 0 ? (
                    currentReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.announcementType || "—"}</td>
                        <td>{report.todayDate ? report.todayDate.split('T')[0] : "—"}</td>
                        <td>{report.userName || "—"}</td>
                        <td style={{ maxWidth: "167px", whiteSpace: "normal", wordWrap: "break-word" }}>{report.announcementDescription!="None"?report.announcementDescription: "—"}</td>
                        <td>{report.siteLocation!='None' ?report.siteLocation:"—"}</td>
                        <td>{report.binNumber || "—"}</td>
                        <td>{report.regionName!='None' ?report.regionName:"—"}</td>
                        <td>{analyzePriority(report)}</td>
                        <td>
                          {report.photoFile ? (
                            <img
                              src={report.photoFile}
                              alt="Report"
                              className={styles.reportImage}
                              style={{ width: "150px", height: "150px", borderRadius:"10px", border:"3px solid rgb(46, 125, 50)"}}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptPublic(report)}
                            style={{width:"60px",height:"30.6px",marginBottom:"4px", marginRight:"2px"}}
                          >
                            <span style={{marginLeft:"-3px"}}>Accept</span>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectPublic(report)}
                            style={{width:"60px",height:"30.6px",marginBottom:"4px",}}
                          >
                            <span>Reject</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">No pending reports found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination for User Reports */}
            <div className={styles.paginationContainer}>
              <div>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "primary" : "light"}
                    style={{
                      backgroundColor: currentPage === i + 1 ? "#2e7d32" : "white",
                      color: currentPage === i + 1 ? "white" : "black",
                      border: currentPage === i + 1 ? "#2e7d32" : "white",
                    }}
                    onClick={() => paginate(i + 1)}
                    className={styles.paginationButton}
                    disabled={loadingPublic}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <p style={{color:"rgb(21 87 36)",fontWeight:"bold"}}>
                Total Reports: {filteredReports.length}
              </p>
            </div>
          </div>
        </Tab>
        
        {/* <Tab eventKey="paid" title="Paid Announcements">
          <div className="mt-4">
            <h3 className={styles.subHeader}>Paid Advertisements</h3>
            
            {/* TABLE for Paid Announcements */}
            {/* <div className={styles.tableWrapper}>
              <Table striped bordered hover responsive className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Institution</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Start Date</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Payment Method</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPaid ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentPaid.length > 0 ? (
                    currentPaid.map((announcement) => (
                      <tr key={announcement.id}>
                        <td>{announcement.institutionName}</td>
                        <td>{announcement.institutionType}</td>
                        <td>{announcement.contactNumber}</td>
                        <td>{announcement.institutionAddress}</td>
                        <td>{announcement.startDate}</td>
                        <td>{announcement.subscriptionDuration}</td>
                        <td>${announcement.price?.toFixed(2) || "0.00"}</td>
                        <td>{announcement.paymentMethod}</td>
                        <td>{announcement.additionalNotes || "—"}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptPaid(announcement)}
                            style={{ marginBottom: "3px" }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectPaid(announcement)}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">No pending paid announcements</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination for Paid Announcements */}
            {/* <div className={styles.paginationContainer}>
              <div>
                {Array.from({ length: totalPagesPaid }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPagePaid === i + 1 ? "primary" : "light"}
                    style={{
                      backgroundColor: currentPagePaid === i + 1 ? "#2e7d32" : "white",
                      color: currentPagePaid === i + 1 ? "white" : "black",
                      border: currentPagePaid === i + 1 ? "#2e7d32" : "white",
                    }}
                    onClick={() => paginatePaid(i + 1)}
                    className={styles.paginationButton}
                    disabled={loadingPaid}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <p style={{color:"rgb(21 87 36)",fontWeight:"bold"}}>
                Total Paid Announcements: {pendingPaidAnnouncements.length}
              </p>
            </div>
          </div> 
        </Tab>  */}
        
        <Tab eventKey="contact" title="Contact Us">
          <div className="mt-4">
            <h3 className={styles.subHeader}>Contact Us Reports</h3>
            
            {/* FILTERS for Contact Us Reports */}
            <div className={styles.filterGrid}>
              <div className={styles.filterBlock}>
                <label className={styles.filterLabel} style={{marginLeft:"5px",marginBottom:"5px"}}>Date Order</label>
                <Form.Select
                  value={filterContactUsByDate}
                  onChange={(e) => setFilterContactUsByDate(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Select Date Order</option>
                  <option value="oldest">Oldest to Newest</option>
                  <option value="newest">Newest to Oldest</option>
                </Form.Select>
              </div>
            </div>

            {/* TABLE for Contact Us Reports */}
            <div className={styles.tableWrapper}>
              <Table striped bordered hover responsive className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingContact ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentContacts.length > 0 ? (
                    currentContacts.map((report) => (
                      <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>{report.email}</td>
                        <td style={{ maxWidth: "167px", whiteSpace: "normal", wordWrap: "break-word" }}>{report.message}</td>
                        <td>{report.todayDate}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleNotify(report)}
                            className={styles.notifyButton}
                          >
                            Reply
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No contact messages found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination for Contact Us Reports */}
            <div className={styles.paginationContainer}>
              <div>
                {Array.from({ length: totalPagesContact }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPageContact === i + 1 ? "primary" : "light"}
                    style={{
                      backgroundColor: currentPageContact === i + 1 ? "#2e7d32" : "white",
                      color: currentPageContact === i + 1 ? "white" : "black",
                      border: currentPageContact === i + 1 ? "#2e7d32" : "white",
                    }}
                    onClick={() => paginateContact(i + 1)}
                    className={styles.paginationButton}
                    disabled={loadingContact}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <p style={{color:"rgb(21 87 36)",fontWeight:"bold"}}>
                Total Contact Us Reports: {filteredContactUs.length}
              </p>
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Reject Modal (Public) */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Reject Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikReject.handleSubmit}>
            <Form.Group>
              <Form.Label>Reason:</Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                placeholder="Enter rejection reason OR leave blank to skip"
                rows={3}
                value={formikReject.values.reason}
                onChange={formikReject.handleChange}
                onBlur={formikReject.handleBlur}
                isInvalid={formikReject.touched.reason && !!formikReject.errors.reason}
                style={{ height: "100px", resize: "none" }}
              />
              <Form.Control.Feedback type="invalid">
                {formikReject.errors.reason}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setModalShow(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Send Rejection
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      {/* Reject Modal (Paid) */}
      <Modal show={modalShowRejectPaid} onHide={() => setModalShowRejectPaid(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Reject Paid Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikRejectPaid.handleSubmit}>
            <Form.Group>
              <Form.Label>Reason:</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter rejection reason OR leave blank to skip"

                name="reason"
                rows={3}
                value={formikRejectPaid.values.reason}
                onChange={formikRejectPaid.handleChange}
                onBlur={formikRejectPaid.handleBlur}
                isInvalid={formikRejectPaid.touched.reason && !!formikRejectPaid.errors.reason}
                style={{ height: "100px", resize: "none" }}
              />
              <Form.Control.Feedback type="invalid">
                {formikRejectPaid.errors.reason}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setModalShowRejectPaid(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Send Rejection
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      {/* Notify Modal (Contact Us) */}
      <Modal show={modalShowNotify} onHide={() => setModalShowNotify(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Reply to User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={formikNotify.handleSubmit}>
            <Form.Group>
              <Form.Label>Reply:</Form.Label>
              <Form.Control
                as="textarea"
                name="reason"
                rows={3}
                value={formikNotify.values.reason}
                onChange={formikNotify.handleChange}
                onBlur={formikNotify.handleBlur}
                isInvalid={formikNotify.touched.reason && !!formikNotify.errors.reason}
                style={{ height: "100px", resize: "none" }}
              />
              <Form.Control.Feedback type="invalid">
                {formikNotify.errors.reason}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setModalShowNotify(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Send Reply
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}