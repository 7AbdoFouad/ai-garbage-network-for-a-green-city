import React, { useEffect, useState, useMemo,useRef  } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import useUser from "../../hooks/useUser";
import { string, object } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";

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
    fetchUser
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

  const handleAccept = async(report) => {
    addUserNotification({
      userId: report.userId,
      notificationContent: `Report accepted: ${report.AnnouncementType}`,
      notificationDate: new Date().toISOString().split("T")[0],
    });
    const user =await fetchUser(report.userId);
    updateUser(report.userId, { ...user, numOfAcceptedAnnouncementsCount: user.numOfAcceptedAnnouncementsCount + 1 });

    deleteUsersAnnouncements(report.id);
    toast.success("Report accepted successfully");
    setSelectedReport(null);
    // 🛠 Fix Pagination: If the page is now empty, go to the previous page
    const newTotalPages = Math.ceil(
      (usersAnnouncements.length - 1) / reportsPerPage
    );
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

  // Use useMemo to compute filteredReports so it only recalculates when dependencies change
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

  // Adjust currentPage if needed when filteredReports change
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip running the effect on initial render
    }
    const newTotalPages = Math.ceil((filteredReports.length) / reportsPerPage) ;    
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

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastContact = currentPageContact * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContactUs.slice(
    indexOfFirstContact,
    indexOfLastContact
  );
  const totalPagesContact = Math.ceil(
    filteredContactUs.length / contactsPerPage
  );
  const paginateContact = (pageNumber) => setcurrentPageContact(pageNumber);

  const formikReject = useFormik({
    initialValues: {
      reason: "",
    },
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
        // 🛠 Fix Pagination: If the page is now empty, go to the previous page
        const newTotalPages = Math.ceil(
          (usersAnnouncements.length - 1) / reportsPerPage
        );
        if (currentPage > newTotalPages) {
          const newPage = Math.max(newTotalPages - 1, 1);
          setCurrentPage(newPage);
          sessionStorage.setItem("currentPage", newPage);
        }
      }
    },
  });

  const formikNotify = useFormik({
    initialValues: {
      reason: "",
    },
    validationSchema: notifySchema,
    onSubmit: (values) => {
      if (selectedContactUs) {
        addUserNotification({
          userId: selectedContactUs.userId,
          notificationContent: `Reply of your message "${selectedContactUs.message}" : ${values.reason}`,
          notificationDate: new Date().toISOString().split("T")[0],
        });
        deleteContactUs(selectedContactUs.id);
        toast.success("Reply message sent successfully");
        setModalShowNotify(false);
        setselectedContactUs(null);
        formikNotify.resetForm();
        // 🛠 Fix Pagination: If the page is now empty, go to the previous page
        const newTotalPagesContact = Math.ceil(
          (contactUs.length - 1) / contactsPerPage
        );
        if (currentPageContact > newTotalPagesContact) {
          const newPage = Math.max(newTotalPagesContact - 1, 1);
          setcurrentPageContact(newPage);
          sessionStorage.setItem("currentPageContact", newPage);
        }
      }
    },
  });

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">User Reports</h2>
      <div className="d-flex gap-2 mb-3">
      <div style={{width: "25%",marginLeft: "5px"}}>Filter by: Report Type</div>
      <div style={{width: "25%",marginLeft: "5px"}}>Filter by: Date</div>
      <div style={{width:"25%",marginLeft: "5px"}}>Filter by: Region</div>
      <div style={{width:"25%",marginLeft: "5px"}}>Filter by: Priority</div>
      </div>
      <div className="d-flex gap-2 mb-3">
        <Form.Select
          onChange={(e) => {
            setFilterType(e.target.value);
            
          }}
        >
          
          <option style={{ display: "none" }} value="">
          Select Report Type
          </option>
          <option value="">All</option>
          <option value="Full Bin">Full Bin</option>
          <option value="Damaged Bin">Damaged Bin</option>
          <option value="Scattered Waste">Scattered Waste</option>
          <option value="Hazardous Material Leak">
            Hazardous Material Leak
          </option>
          <option value="Waste Not Collected">Waste Not Collected</option>
        </Form.Select>
        <Form.Select
          onChange={(e) => {
            setFilterDate(e.target.value);
          }}
        >
          <option style={{ display: "none" }} value="">
          Select Date Order
          </option>
          <option value="oldest">Oldest to Newest</option>
          <option value="newest">Newest to Oldest</option>
        </Form.Select>
        <Form.Select
          onChange={(e) => {
            setFilterRegion(e.target.value);
          }}
        >
          <option style={{ display: "none" }} value="">
          Select Region
          </option>
          <option value="">All</option>
          {regions.map((region) => (
            <option key={region.id} value={region.regionName}>
              {region.regionName}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          onChange={(e) => {
            setFilterPriority(e.target.value); 
          }}
        >
          <option style={{ display: "none" }} value="">
          Select Priority
          </option>
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="unknown">Unknown Priority</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>User</th>
            <th>Message</th>
            <th>Location</th>
            <th>Bin Number</th>
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
                    width="80"
                    height="80"
                    style={{ objectFit: "cover",borderRadius: "3px" }}
                
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
                >
                  Accept
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleReject(report)}
                >
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <p>Total Reports: {filteredReports.length}</p>
        <div>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "primary" : "light"}
              onClick={() => paginate(i + 1)}
              className="me-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      <hr className="my-4" />
      <h3 className="text-center">Reports from Contact Us Page</h3>
      <div className="d-flex gap-2 mb-3">

      <div style={{width: "25%",marginLeft: "5px"}}>Filter by: Date</div>

      </div>
      <div className="d-flex gap-2 mb-3">
        <Form.Select onChange={(e) => setfilterContactUsByDate(e.target.value)}>
          <option style={{ display: "none" }} value="">
          Select Date Order
          </option>
          <option value="oldest">Oldest to Newest</option>
          <option value="newest">Newest to Oldest</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
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
                  className="ms-2"
                  onClick={() => handleNotify(report)}
                >
                  Notify
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between align-items-center">
        <p className="text-end">
          Total reports from Contact Us: {contactUs.length}
        </p>
        <div>
          {Array.from({ length: totalPagesContact }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPageContact === i + 1 ? "primary" : "light"}
              onClick={() => paginateContact(i + 1)}
              className="me-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
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
              />
              {formikReject.touched.reason && formikReject.errors.reason && (
                <div className="invalid-feedback">
                  {formikReject.errors.reason}
                </div>
              )}
            </Form.Group>
            <Modal.Footer className="mt-3">
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

      <Modal show={modalShowNotify} onHide={() => setModalShowNotify(false)}>
        <Modal.Header closeButton>
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
                className={`form-control ${
                  formikNotify.touched.reason && formikNotify.errors.reason
                    ? "is-invalid"
                    : ""
                }`}
                style={{ height: "100px", resize: "none" }}
              />
              {formikNotify.touched.reason && formikNotify.errors.reason && (
                <div className="invalid-feedback">
                  {formikNotify.errors.reason}
                </div>
              )}
            </Form.Group>
            <Modal.Footer className="mt-3">
              <Button
                variant="secondary"
                onClick={() => setModalShowNotify(false)}
              >
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
