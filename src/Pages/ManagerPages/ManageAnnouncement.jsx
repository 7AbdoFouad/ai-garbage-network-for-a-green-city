import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import useUser from "../../hooks/useUser";
import { string, object } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import styles from "./ManageAnnouncement.module.css";

const rejectSchema = object().shape({
  reason: string()
    .required("Rejection reason is required")
    .min(10, "Message is too short"),
});

const notifySchema = object().shape({
  reason: string()
    .required("Reply is required")
    .min(10, "Message is too short"),
});

export default function ManageAnnouncement() {
  const {
    usersAnnouncements,
    contactUs,
    deleteContactUs,
    regions,
    addUserNotification,
    updateUser,
    addAvailable_UsersAnnouncements_Tasks,
    fetchUser,
    deleteUsersAnnouncements
  } = useUser();

  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterContactUsByDate, setfilterContactUsByDate] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedContactUs, setselectedContactUs] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalShowNotify, setModalShowNotify] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(sessionStorage.getItem("currentPage")) || 1
  );
  const [currentPageContact, setcurrentPageContact] = useState(
    parseInt(sessionStorage.getItem("currentPageContact")) || 1
  );
  const [acceptedReportIds, setAcceptedReportIds] = useState([]);

  const reportsPerPage = 5;
  const contactsPerPage = 5;
  const isFirstRender = useRef(true);

  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("currentPageContact", currentPageContact);
  }, [currentPageContact]);

  const analyzePriority = (report) => {
    const text = (report.AnnouncementDescription || "").toLowerCase();
    const highPriorityKeywords = [
      "urgent", "immediately", "danger", "critical", "emergency",
      "life-threatening", "hazard", "leak", "explosion", "fire",
      "toxic", "severe", "biohazard", "gas", "injury", "collapse"
    ];
    const mediumPriorityKeywords = [
      "notice", "soon", "warning", "attention", "delay",
      "repair needed", "damaged", "malfunction", "issue",
      "problem", "not working", "maintenance", "breakdown", "missing"
    ];
    
    const containsKeyword = (keywords) => 
      keywords.some(keyword => text.includes(keyword));

    if (containsKeyword(highPriorityKeywords)) return "high";
    if (containsKeyword(mediumPriorityKeywords)) return "medium";
    return text === "" ? "unknown" : "low";
  };

  const handleAccept = async (report) => {
    try {
      // Add notification
      await addUserNotification({
        notificationContent: `Report accepted: ${report.AnnouncementType}`,
        notificationDate: new Date().toISOString().split("T")[0],
        isRead: "false",
        userId: report.userId
      });

      // Update user stats
      const user = await fetchUser(report.userId);
      await updateUser(report.userId, {
        ...user,
        numOfAcceptedAnnouncementsCount: user.numOfAcceptedAnnouncementsCount + 1,
      }); 


      // Add to available tasks
      await addAvailable_UsersAnnouncements_Tasks({ requestId: report.id });

      // Hide from UI
      setAcceptedReportIds(prev => [...prev, report.id]);
      toast.success("Report accepted successfully");

      // Pagination adjustment
      const newTotalPages = Math.ceil((filteredReports.length - 1) / reportsPerPage);
      if (currentPage > newTotalPages) {
        const newPage = Math.max(newTotalPages, 1);
        setCurrentPage(newPage);
      }
    } catch (error) {
      toast.error("Error accepting report: " + error.message);
    }
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setModalShow(true);
  };

  const handleNotify = (report) => {
    setselectedContactUs(report);
    setModalShowNotify(true);
  };

  const filteredReports = useMemo(() => {
    let reports = usersAnnouncements.filter(report => 
      !acceptedReportIds.includes(report.id)
    );

    if (filterType) reports = reports.filter(r => r.AnnouncementType === filterType);
    if (filterRegion) reports = reports.filter(r => r.region === filterRegion);
    if (filterPriority) reports = reports.filter(r => analyzePriority(r) === filterPriority);
    
    return filterDate === "newest" 
      ? [...reports].sort((a, b) => new Date(b.todayDate) - new Date(a.todayDate))
      : filterDate === "oldest" 
        ? [...reports].sort((a, b) => new Date(a.todayDate) - new Date(b.todayDate))
        : reports;
  }, [usersAnnouncements, acceptedReportIds, filterType, filterRegion, filterPriority, filterDate]);

  const filteredContactUs = useMemo(() => {
    return filterContactUsByDate === "newest"
      ? [...contactUs].sort((a, b) => new Date(b.todayDate) - new Date(a.todayDate))
      : filterContactUsByDate === "oldest"
        ? [...contactUs].sort((a, b) => new Date(a.todayDate) - new Date(b.todayDate))
        : contactUs;
  }, [contactUs, filterContactUsByDate]);

  // Pagination calculations
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const indexOfLastContact = currentPageContact * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContactUs.slice(indexOfFirstContact, indexOfLastContact);
  const totalPagesContact = Math.ceil(filteredContactUs.length / contactsPerPage);

  // Formik setups
  const formikReject = useFormik({
    initialValues: { reason: "" },
    validationSchema: rejectSchema,
    onSubmit: async (values) => {
      try {
        await addUserNotification({
          notificationContent: `Report rejected: ${selectedReport.AnnouncementType} - Reason: ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
          userId: selectedReport.userId
        });
        setAcceptedReportIds(prev => [...prev, selectedReport.id]);
        await deleteUsersAnnouncements(selectedReport.id);
        toast.success("Rejection sent successfully");
        setModalShow(false);
        formikReject.resetForm();
      } catch (error) {
        toast.error("Error rejecting report: " + error.message);
      }
    }
  });

  const formikNotify = useFormik({
    initialValues: { reason: "" },
    validationSchema: notifySchema,
    onSubmit: async (values) => {
      try {
        await addUserNotification({
          notificationContent: `Reply: "${selectedContactUs.message}" - ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
          userId: selectedContactUs.userId
        });
        await deleteContactUs(selectedContactUs.id);
        toast.success("Reply sent successfully");
        setModalShowNotify(false);
        formikNotify.resetForm();
      } catch (error) {
        toast.error("Error sending notification: " + error.message);
      }
    }
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>User Reports</h2>

      {/* FILTERS for User Reports */}
      <div className={styles.filterGrid}>
        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}style={{marginLeft:"5px",marginBottom:"5px"}}>Report Type</label>
          <Form.Select
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}            style={{maxWidth: "200px"}}

            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "none";
              e.target.style.borderWidth = "0px";
            }}
          >
            <option value="">All Report Types</option>
            <option value="Full Bin">Full Bin</option>
            <option value="Damaged Bin">Damaged Bin</option>
            <option value="Scattered Waste">Scattered Waste</option>
            <option value="Hazardous Material Leak">Hazardous Material Leak</option>
            <option value="Waste Not Collected">Waste Not Collected</option>
          </Form.Select>
        </div>

        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}style={{marginLeft:"5px",marginBottom:"5px"}}>Date Order</label>
          <Form.Select
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.filterSelect}            style={{maxWidth: "200px"}}

            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "none";
              e.target.style.borderWidth = "0px";
            }}
          >
            <option value="">Select Date Order</option>
            <option value="oldest">Oldest to Newest</option>
            <option value="newest">Newest to Oldest</option>
          </Form.Select>
        </div>

        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}style={{marginLeft:"5px",marginBottom:"5px"}}>Region</label>
          <Form.Select
            onChange={(e) => setFilterRegion(e.target.value)}
            className={styles.filterSelect}            style={{maxWidth: "200px"}}

            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "none";
              e.target.style.borderWidth = "0px";
            }}
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
          <label className={styles.filterLabel}style={{marginLeft:"5px",marginBottom:"5px"}}>Priority</label>
          <Form.Select
            onChange={(e) => setFilterPriority(e.target.value)}
            className={styles.filterSelect}
            style={{maxWidth: "200px"}}
            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "#00980DFF";
              e.target.style.borderWidth = "2px";
            }}
            onBlur={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = "none";
              e.target.style.borderWidth = "0px";
            }}
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
            {currentReports.map((report) => (
              <tr key={report.id}>
                <td>{report.AnnouncementType || "—"}</td>
                <td>{report.todayDate || "—"}</td>
                <td>{report.userName || "—"}</td>
                <td style={{ minWidth: "120px" }}>{report.AnnouncementDescription || "—"}</td>
                <td>{report.siteLocation}</td>
                <td>{report.binNumber || "—"}</td>
                <td>{report.region || "—"}</td>
                <td>{analyzePriority(report)}</td>
                <td>
                  {report.photoFile ? (
                    <img
                      src={report.photoFile}
                      alt="Report"
                      className={styles.reportImage}
                      style={{  width: "150px", height: "150px" ,borderRadius:"10px",border:"3px solid rgb(46, 125, 50)"}}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAccept(report)}
                    // className={styles.acceptButton}
                    style={{width:"53.39px",height:"30.6px",marginBottom:"3px"}}
                  >
                    <span style={{marginLeft:"-3px"}}>
                    Accept</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(report)}
                    
                    style={{width:"53.39px",height:"30.6px"}}

                  ><span style={{marginLeft:"-2px"}}>
                    Reject</span>
                  </Button>
                </td>
              </tr>
            ))}
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
              style={{backgroundColor:currentPage === i + 1 ? "#2e7d32" : "white",
                color:currentPage === i + 1 ? "white" : "black",
                border:currentPage === i + 1 ? "#2e7d32" : "white",
              }}
              onClick={() => paginate(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{color:"rgb(21 87 36)",fontWeight:"bold"}}>Total Reports: {filteredReports.length}</p>
      </div>

      <hr className={styles.divider} />
      <h3 className={styles.subHeader}>Contact Us Reports</h3>

      {/* FILTERS for Contact Us Reports */}
      <div className={styles.filterGrid}>
        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}style={{marginLeft:"5px",marginBottom:"5px"}}>Date Order</label>
          <Form.Select
            onChange={(e) => setfilterContactUsByDate(e.target.value)}
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
            {currentContacts.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.email}</td>
                <td >{report.message}</td>
                <td>{report.todayDate}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleNotify(report)}
                    className={styles.notifyButton}
                  >
                    Notify
                  </Button>
                </td>
              </tr>
            ))}
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
              style={{backgroundColor:currentPageContact === i + 1 ? "#2e7d32" : "white",
                color:currentPageContact === i + 1 ? "white" : "black",
                border:currentPageContact === i + 1 ? "#2e7d32" : "white",
              }}
              onClick={() => paginateContact(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{color:"rgb(21 87 36)",fontWeight:"bold"}}>Total Contact Us Reports: {contactUs.length}</p>
      </div>

      {/* Reject Modal */}
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
                rows={3}
                value={formikReject.values.reason}
                onChange={formikReject.handleChange}
                // onBlur={formikReject.handleBlur}
                className={`form-control ${
                  formikReject.touched.reason && formikReject.errors.reason
                    ? "is-invalid"
                    : ""
                }`}
                style={{ height: "100px", resize: "none" }}
                // onFocus={()=>{document.activeElement.blur()}}
                onFocus={(e) => {
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "#00980DFF";
                  e.target.style.borderWidth = "2px";
                }}
                onBlur={(e) => {
                  formikReject.handleBlur(e);
                  e.target.style.outline = "none";
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "none";
                  e.target.style.borderWidth = "0px";
                }}

              />
              {formikReject.touched.reason && formikReject.errors.reason && (
                <div className="invalid-feedback">{formikReject.errors.reason}</div>
              )}
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

      {/* Notify Modal */}
      <Modal show={modalShowNotify} onHide={() => setModalShowNotify(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title>Notify User</Modal.Title>
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
                // onBlur={formikNotify.handleBlur}
                className={`form-control  ${
                  formikNotify.touched.reason && formikNotify.errors.reason
                    ? "is-invalid"
                    : ""
                }`}
                style={{ height: "100px", resize: "none", }}
                // onFocus={()=>{document.activeElement.blur()}}
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
                  e.target.style.borderColor = "none";
                  e.target.style.borderWidth = "0px";
                }}
              />
              {formikNotify.touched.reason && formikNotify.errors.reason && (
                <div className="invalid-feedback">{formikNotify.errors.reason}</div>
              )}
            </Form.Group>
            <Modal.Footer className={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setModalShowNotify(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Send Notification
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
