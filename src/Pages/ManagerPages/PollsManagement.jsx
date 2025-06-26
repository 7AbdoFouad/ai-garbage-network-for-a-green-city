import React, { useState, useEffect, useRef } from "react";
import styles from "./PollsManagement.module.css";
import PollEditPopup from "./PollEditPopup";
import PollResultsPopup from "./PollResultsPopup";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Table, Button } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { IoIosAddCircle } from "react-icons/io";
import { IoIosCloudDone } from "react-icons/io";
import { MdOutlinePendingActions } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const pollValidationSchema = Yup.object({
  pollName: Yup.string()
    .required("Poll name is required")
    .min(3, "Poll name must be at least 3 characters"),
  pollDesc: Yup.string()
    .required("Poll description is required")
    .min(5, "Description must be at least 5 characters"),
  pollEndDate: Yup.date()
    .required("End date is required")
    // .test(
    //   "is-future",
    //   "The expiry date must be in the future",
    //   function (value) {
    //     return value > new Date();
    //   }
    // ),
    ,
  pollFormLink: Yup.string()
    .url("Invalid URL format")
    .required("Form link is required"),
  imgFile: Yup.mixed().required("Image is required"),
  excelFileLink: Yup.string()
    .required("Excel file link is required")
    .url("Invalid URL format"),
});

export default function PollsManagement() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedResultsPoll, setSelectedResultsPoll] = useState(null);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [questionResults, setQuestionResults] = useState({});
  const [questions, setQuestions] = useState([]);
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [availableCurrentPagePolls, setAvailableCurrentPagePolls] = useState(1);
  const [completedCurrentPagePolls, setCompletedCurrentPagePolls] = useState(1);
  const PollsItemsPerPage = 5;

  // Fetch token from cookies
  const getAuthToken = () => {
    return Cookies.get("token");
  };

  // Fetch polls from API
  const fetchPolls = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/Polls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch polls");
      
      const data = await response.json();
      setPolls(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // Handle pagination changes
  const handleAvailablePagePollsChange = (page) => {
    setAvailableCurrentPagePolls(page);
  };

  const handleCompletedPagePollsChange = (page) => {
    setCompletedCurrentPagePolls(page);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => formik.setFieldValue("imgFile", reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Edit poll handler
  const handleEdit = (poll) => {
    setSelectedPoll(poll);
    setShowEditPopup(true);
  };

  // Delete poll handler
  const handleDelete = async (pollId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/Polls/${pollId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to delete poll");
      
      toast.success("Poll deleted successfully!");
      fetchPolls(); // Refresh polls list
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Show results handler
  const handleShowResults = (poll) => {
    setSelectedResultsPoll(poll);
    setShowResultsPopup(true);
  };

  // Save updated poll
  const handleSave = async (updatedPoll) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      
      // Append updated fields
      formData.append("pollName", updatedPoll.pollName);
      formData.append("pollDesc", updatedPoll.pollDesc);
      formData.append("pollEndDate", updatedPoll.pollEndDate);
      formData.append("pollLink", updatedPoll.pollFormLink);
      formData.append("photo", updatedPoll.imgFile || "0");
      formData.append("excelFileLink", updatedPoll.excelFileLink);
      
      // Handle image update if changed
      if (updatedPoll.imgFile && updatedPoll.imgFile.startsWith("data:image")) {
        const blob = await fetch(updatedPoll.imgFile).then(r => r.blob());
        formData.append("photo", blob, "poll-image.png");
      }
      
      const response = await fetch(`/api/Polls/${updatedPoll.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to update poll");
      
      toast.success("Poll updated successfully!");
      fetchPolls(); // Refresh polls list
      setShowEditPopup(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formik = useFormik({
    initialValues: {
      pollName: "",
      pollDesc: "",
      pollEndDate: "",
      pollFormLink: "",
      imgFile: "",
      excelFileLink: "",
    },
    validationSchema: pollValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const formData = new FormData();
        
        // Append form values
        formData.append("pollName", values.pollName);
        formData.append("pollDesc", values.pollDesc);
        formData.append("pollDate", new Date().toISOString().split("T")[0]);
        formData.append("pollEndDate", values.pollEndDate);
        formData.append("numOfSubscribers", "0");
        formData.append("pollLink", values.pollFormLink);
        formData.append("excelFileLinkLink", values.excelFileLinkLink);
        
        // Handle image upload
        if (values.imgFile) {
          const blob = await fetch(values.imgFile).then(r => r.blob());
          formData.append("photo", blob, "poll-image.png");
        }
        
        const response = await fetch("/api/Polls", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add poll");
        }
        
        toast.success("New poll added successfully!");
        inputRef.current.value = null;

        fetchPolls(); // Refresh polls list
        resetForm();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
  });
  ;

  // Handle Excel file upload for analysis
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        setExcelData(data);
        if (data.length) {
          const keys = Object.keys(data[0]).filter((k) => k !== "طابع زمني");
          setQuestions(keys);
          const agg = {};
          keys.forEach((q) => (agg[q] = {}));
          data.forEach((row) =>
            keys.forEach(
              (q) => row[q] && (agg[q][row[q]] = (agg[q][row[q]] || 0) + 1)
            )
          );
          setQuestionResults(agg);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Filter polls
  const underway = polls.filter((p) => new Date(p.pollEndDate) > new Date());
  const completed = polls.filter((p) => new Date(p.pollEndDate) <= new Date());

  // Paginate polls
  const paginatedAvailablePolls = underway.slice(
    (availableCurrentPagePolls - 1) * PollsItemsPerPage,
    availableCurrentPagePolls * PollsItemsPerPage
  );
  
  const paginatedCompletedPolls = completed.slice(
    (completedCurrentPagePolls - 1) * PollsItemsPerPage,
    completedCurrentPagePolls * PollsItemsPerPage
  );
  
  const totalAvailablePollsPages = Math.ceil(underway.length / PollsItemsPerPage);
  const totalCompletedPollsPages = Math.ceil(completed.length / PollsItemsPerPage);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 Manage Surveys</h2>

      {/* Underway Polls Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <MdOutlinePendingActions fontSize={90} /> Underway Polls
        </h3>
        <table className={styles.pollTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAvailablePolls.map((poll) => (
              <tr key={poll.id}>
                <td>{poll.pollName}</td>
                <td>{poll.pollDesc}</td>
                <td>{poll.pollEndDate.split("T")[0]}</td>
                <td>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(poll)}
                  >
                    <span style={{marginLeft: "-8px"}}>
                    ✏️ Edit</span>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(poll.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
            <div className={styles.paginationContainer}>
              <div>
                {Array.from({ length: totalAvailablePollsPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={
                      availableCurrentPagePolls === i + 1 ? "primary" : "light"
                    }
                    style={{
                      backgroundColor:
                        availableCurrentPagePolls === i + 1 ? "#2e7d32" : "#ddf7e9",
                      color: availableCurrentPagePolls === i + 1 ? "white" : "black",
                      border:
                        availableCurrentPagePolls === i + 1 ? "#2e7d32" : "#ddf7e9",
                    }}
                    onClick={() => handleAvailablePagePollsChange(i + 1)}
                    className={styles.paginationButton}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <p style={{ fontWeight: "bold" }}>
                Number of Available Polls: {underway.length}
              </p>
            </div>
      </section>

      {/* Completed Polls Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <IoIosCloudDone fontSize={90} /> Completed Polls
        </h3>
        <table className={styles.pollTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompletedPolls.map((poll) => (
              <tr key={poll.id}>
                <td>{poll.pollName}</td>
                <td>{poll.pollDesc}</td>
                <td>{poll.pollEndDate.split("T")[0]}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleShowResults(poll)}
                  >
                    📊 Results
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(poll.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
      <div className={styles.paginationContainer}>
        <div>
          {Array.from({ length: totalCompletedPollsPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={
                completedCurrentPagePolls === i + 1 ? "primary" : "light"
              }
              style={{
                backgroundColor:
                completedCurrentPagePolls === i + 1 ? "#2e7d32" : "#ddf7e9",
                color: completedCurrentPagePolls === i + 1 ? "white" : "black",
                border:
                  completedCurrentPagePolls === i + 1 ? "#2e7d32" : "#ddf7e9",
              }}
              onClick={() => handleCompletedPagePollsChange(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{ fontWeight: "bold" }}>
        Number Of Completed Polls: {completed.length}
        </p>
      </div>
      </section>

      {/* Add New Poll Section */}
      <section className={styles.addSection}>
        <h3 className={styles.sectionTitle}>
          <IoIosAddCircle fontSize={"5rem"} />
          <span>Add New Poll</span>
        </h3>
        
        <form onSubmit={formik.handleSubmit} className={styles.pollForm}>
          <label htmlFor="pollName">📌 Enter survey name:</label>
          <input
            type="text"
            id="pollName"
            name="pollName"
            placeholder="Enter survey name"
            value={formik.values.pollName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.pollName && formik.errors.pollName ? "is-invalid" : ""}`}
            onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderWidth = "2px";
            }}

          />
          {formik.touched.pollName && formik.errors.pollName && (
            <div className="invalid-feedback">{formik.errors.pollName}</div>
          )}

          <label htmlFor="pollDesc">📄 Survey Description:</label>
          <textarea
            id="pollDesc"
            name="pollDesc"
            placeholder="Enter survey description"
            value={formik.values.pollDesc}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.pollDesc && formik.errors.pollDesc ? "is-invalid" : ""}`}
             onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderWidth = "2px";
            }}
            style={{ height: "150px", resize: "none" }}
          />
          {formik.touched.pollDesc && formik.errors.pollDesc && (
            <div className="invalid-feedback">{formik.errors.pollDesc}</div>
          )}

          <label htmlFor="pollEndDate">📅 Expiry Date:</label>
          <input
            type="date"
            id="pollEndDate"
            name="pollEndDate"
            value={formik.values.pollEndDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.pollEndDate && formik.errors.pollEndDate ? "is-invalid" : ""}`}
                         onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderWidth = "2px";
            }}
          />
          {formik.touched.pollEndDate && formik.errors.pollEndDate && (
            <div className="invalid-feedback">{formik.errors.pollEndDate}</div>
          )}

          <label htmlFor="pollFormLink">🔗 Form link:</label>
          <input
            type="text"
            id="pollFormLink"
            name="pollFormLink"
            placeholder="Enter the link to the survey form"
            value={formik.values.pollFormLink}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.pollFormLink && formik.errors.pollFormLink ? "is-invalid" : ""}`}
                         onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderWidth = "2px";
            }}
          />
          {formik.touched.pollFormLink && formik.errors.pollFormLink && (
            <div className="invalid-feedback">{formik.errors.pollFormLink}</div>
          )}

          <label htmlFor="imgFile">🖼 Survey image:</label>
          <input
            type="file"
            id="imgFile"
            name="imgFile"
            ref={inputRef}
            accept="image/*"
            onChange={handleImageChange}
            className={`form-control ${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
                         onFocus={(e) => {
              e.target.style.outline = "none";
              e.target.style.boxShadow = "none";
              e.target.style.borderWidth = "2px";
            }}

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
                style={{ background: "#1bad1d" }}
              />
            </div>
          )}

          <label htmlFor="excelFileLink">📊 External Excel Link:</label>
          <input
            type="text"
            id="excelFileLink"
            name="excelFileLink"
            placeholder="Enter external Excel link"
            value={formik.values.excelFileLink}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.excelFileLink && formik.errors.excelFileLink ? "is-invalid" : ""}`}
          />
          {formik.touched.excelFileLink && formik.errors.excelFileLink && (
            <div className="invalid-feedback">{formik.errors.excelFileLink}</div>
          )}
          {formik.values.excelFileLink && (
            <div className="mt-2">
              <strong>Link:</strong> {formik.values.excelFileLink}
            </div>
          )}

          <button type="submit" className={loading ?styles.disabledButton:styles.submitButton } disabled={loading}>
          {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </section>

      {/* Analysis Section */}
      {questions.length > 0 && (
        <div className={styles.analysis}>
          <h3 className={styles.sectionTitle}>📈 Excel Analysis</h3>
          {questions.map((q) => {
            const resp = questionResults[q];
            const data = {
              labels: Object.keys(resp),
              datasets: [{ label: q, data: Object.values(resp) }],
            };
            const opts = {
              responsive: true,
              plugins: { title: { display: true, text: q } },
            };
            return <Bar key={q} data={data} options={opts} />;
          })}
        </div>
      )}

      {/* Edit Poll Popup */}
      {showEditPopup && (
        <PollEditPopup
          poll={selectedPoll}
          onSave={handleSave}
          onClose={() => setShowEditPopup(false)}
        />
      )}
      
      {/* Results Popup */}
      {showResultsPopup && (
        <PollResultsPopup
          poll={selectedResultsPoll}
          onClose={() => setShowResultsPopup(false)}
        />
      )}
    </div>
  );
}