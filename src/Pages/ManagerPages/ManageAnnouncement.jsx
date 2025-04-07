import React, { useEffect, useState, useMemo, useRef } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import useUser from "../../hooks/useUser";
import { string, object } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import styles from "./ManageAnnouncement.module.css";

// Yup schemas
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
    deleteUsersAnnouncements,
    regions,
    addUserNotification,
    updateUser,
    fetchUser,
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
  const reportsPerPage = 5;
  const [currentPageContact, setcurrentPageContact] = useState(
    parseInt(sessionStorage.getItem("currentPageContact")) || 1
  );
  const contactsPerPage = 5;

  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("currentPageContact", currentPageContact);
  }, [currentPageContact]);

  // Dummy NLP function to analyze report description and return a priority level
  const analyzePriority = (report) => {
    const text = (report.AnnouncementDescription || "").toLowerCase();
    const highPriorityKeywords = [
      "urgent",
      "immediately",
      "danger",
      "critical",
      "emergency",
      "life-threatening",
      "hazard",
      "leak",
      "explosion",
      "fire",
      "toxic",
      "severe",
      "biohazard",
      "gas",
      "injury",
      "collapse",
    ];
    const mediumPriorityKeywords = [
      "notice",
      "soon",
      "warning",
      "attention",
      "delay",
      "repair needed",
      "damaged",
      "malfunction",
      "issue",
      "problem",
      "not working",
      "maintenance",
      "breakdown",
      "missing",
    ];
    const containsKeyword = (keywords) =>
      keywords.some((keyword) => text.includes(keyword));

    if (containsKeyword(highPriorityKeywords)) {
      return "high";
    } else if (containsKeyword(mediumPriorityKeywords)) {
      return "medium";
    } else if (text === "") {
      return "unknown";
    } else {
      return "low";
    }
  };

  const handleAccept = async (report) => {
    addUserNotification({
      userId: report.userId,
      notificationContent: `Report accepted: ${report.AnnouncementType}`,
      notificationDate: new Date().toISOString().split("T")[0],
    });
    const user = await fetchUser(report.userId);
    updateUser(report.userId, {
      ...user,
      numOfAcceptedAnnouncementsCount: user.numOfAcceptedAnnouncementsCount + 1,
    });
    deleteUsersAnnouncements(report.id);
    toast.success("Report accepted successfully");
    setSelectedReport(null);

    // Fix pagination if page becomes empty
    const newTotalPages = Math.ceil((usersAnnouncements.length - 1) / reportsPerPage);
    if (currentPage > newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setCurrentPage(newPage);
      sessionStorage.setItem("currentPage", newPage);
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

  // Filter reports using useMemo for performance
  const filteredReports = useMemo(() => {
    let reports = usersAnnouncements;
    if (filterType) {
      reports = reports.filter((r) => r.AnnouncementType === filterType);
    }
    if (filterRegion) {
      reports = reports.filter((r) => r.region === filterRegion);
    }
    if (filterPriority) {
      reports = reports.filter((r) => analyzePriority(r) === filterPriority);
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
  }, [usersAnnouncements, filterType, filterRegion, filterPriority, filterDate]);

  // Adjust currentPage if filteredReports changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const newTotalPages = Math.ceil(filteredReports.length / reportsPerPage);
    if (currentPage > newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setCurrentPage(newPage);
      sessionStorage.setItem("currentPage", newPage);
    }
  }, [filteredReports, currentPage, reportsPerPage]);

  // Filter and sort contact us messages
  let filteredContactUs = contactUs;
  if (filterContactUsByDate === "newest") {
    filteredContactUs = filteredContactUs.sort(
      (a, b) => new Date(b.todayDate) - new Date(a.todayDate)
    );
  } else if (filterContactUsByDate === "oldest") {
    filteredContactUs = filteredContactUs.sort(
      (a, b) => new Date(a.todayDate) - new Date(b.todayDate)
    );
  }

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastContact = currentPageContact * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContactUs.slice(
    indexOfFirstContact,
    indexOfLastContact
  );
  const totalPagesContact = Math.ceil(filteredContactUs.length / contactsPerPage);

  const paginateContact = (pageNumber) => setcurrentPageContact(pageNumber);

  // Formik for reject modal
  const formikReject = useFormik({
    initialValues: { reason: "" },
    validationSchema: rejectSchema,
    onSubmit: (values) => {
      if (selectedReport) {
        addUserNotification({
          userId: selectedReport.userId,
          notificationContent: `Report rejected: ${selectedReport.AnnouncementType} - Reason: ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
        });
        deleteUsersAnnouncements(selectedReport.id);
        toast.success("Rejection sent successfully");
        setModalShow(false);
        setSelectedReport(null);
        formikReject.resetForm();

        // Fix pagination if page becomes empty
        const newTotalPages = Math.ceil((usersAnnouncements.length - 1) / reportsPerPage);
        if (currentPage > newTotalPages) {
          const newPage = Math.max(newTotalPages - 1, 1);
          setCurrentPage(newPage);
          sessionStorage.setItem("currentPage", newPage);
        }
      }
    },
  });

  // Formik for notify modal
  const formikNotify = useFormik({
    initialValues: { reason: "" },
    validationSchema: notifySchema,
    onSubmit: (values) => {
      if (selectedContactUs) {
        addUserNotification({
          userId: selectedContactUs.userId,
          notificationContent: `Reply: "${selectedContactUs.message}" - ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
        });
        deleteContactUs(selectedContactUs.id);
        toast.success("Reply sent successfully");
        setModalShowNotify(false);
        setselectedContactUs(null);
        formikNotify.resetForm();

        // Fix pagination if page becomes empty
        const newTotalPagesContact = Math.ceil((contactUs.length - 1) / contactsPerPage);
        if (currentPageContact > newTotalPagesContact) {
          const newPage = Math.max(newTotalPagesContact - 1, 1);
          setcurrentPageContact(newPage);
          sessionStorage.setItem("currentPageContact", newPage);
        }
      }
    },
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>User Reports</h2>

      {/* FILTERS for User Reports */}
      <div className={styles.filterGrid}>
        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}>Report Type</label>
          <Form.Select
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
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
          <label className={styles.filterLabel}>Date Order</label>
          <Form.Select
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Select Date Order</option>
            <option value="oldest">Oldest to Newest</option>
            <option value="newest">Newest to Oldest</option>
          </Form.Select>
        </div>

        <div className={styles.filterBlock}>
          <label className={styles.filterLabel}>Region</label>
          <Form.Select
            onChange={(e) => setFilterRegion(e.target.value)}
            className={styles.filterSelect}
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
          <label className={styles.filterLabel}>Priority</label>
          <Form.Select
            onChange={(e) => setFilterPriority(e.target.value)}
            className={styles.filterSelect}
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
                <td>{report.AnnouncementDescription || "—"}</td>
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
                    className={styles.acceptButton}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(report)}
                    className={`${styles.rejectButton} ms-2`}
                  >
                    Reject
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
          <label className={styles.filterLabel}>Date Order</label>
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
                <td>{report.message}</td>
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
                onBlur={formikReject.handleBlur}
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
                  e.target.style.borderColor = "#ced4da";
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
                onBlur={formikNotify.handleBlur}
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
                  e.target.style.borderColor = "#ced4da";
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
