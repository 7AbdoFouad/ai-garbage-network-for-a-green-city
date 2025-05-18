// PollsManagement.js
import React, { useState } from "react";
import useUser from "../../hooks/useUser";
import styles from "./PollsManagement.module.css";
import PollEditPopup from "./PollEditPopup";
import PollResultsPopup from "./PollResultsPopup";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { IoIosAddCircle } from "react-icons/io";
import { IoIosCloudDone } from "react-icons/io";
import { MdOutlinePendingActions } from "react-icons/md";

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
    .test(
      "is-future",
      "The expiry date must be in the future",
      function (value) {
        return value > new Date();
      }
    ),
  pollFormLink: Yup.string()
    .url("Invalid URL format")
    .required("Form link is required"),
  imgFile: Yup.mixed().required("Image is required"),
  excelFile: Yup.string()
    .required("Excel file link is required")
    .url("Invalid URL format"),
});

export default function PollsManagement() {
  const { Polls, SubscribersOfPolls, deletePoll, updatePoll, users, addPoll } =
    useUser();
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedResultsPoll, setSelectedResultsPoll] = useState(null);
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  const [excelData, setExcelData] = useState([]);
  const [questionResults, setQuestionResults] = useState({});
  const [questions, setQuestions] = useState([]);

  const [availableCurrentPagePolls, setAvailableCurrentPagePolls] = useState(
    parseInt(sessionStorage.getItem("availableCurrentPagePolls")) || 1
  );
  const [completedCurrentPagePolls, setCompletedCurrentPagePolls] = useState(
    parseInt(sessionStorage.getItem("completedCurrentPagePolls")) || 1
  );
  const PollsItemsPerPage = 5;
  const handleAvailablePagePollsChange = (page) => {
    setAvailableCurrentPagePolls(page);
    sessionStorage.setItem("availableCurrentPagePolls", page);
  };

  const handleCompletedPagePollsChange = (page) => {
    setCompletedCurrentPagePolls(page);
    sessionStorage.setItem("completedCurrentPagePolls", page);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => formik.setFieldValue("imgFile", reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (poll) => {
    setSelectedPoll(poll);
    setShowEditPopup(true);
  };

  const handleDelete = (pollId) => {
    try {
      deletePoll(pollId);
      toast.success("Poll deleted successfully!");
      // Fix pagination if page becomes empty
      const newTotalPages = Math.ceil((completedPolls.length - 1) / PollsItemsPerPage );
      if ( completedCurrentPagePolls> newTotalPages) {
      const newPage = Math.max(newTotalPages - 1, 1);
      setCompletedCurrentPagePolls(newPage);
      sessionStorage.setItem("completedCurrentPagePolls", newPage); 
      }
    } catch {
      toast.error("Failed to delete poll. Please try again later.");
    }
  };

  const handleShowResults = (poll) => {
    setSelectedResultsPoll(poll);
    setShowResultsPopup(true);
  };

  const handleSave = (updatedPoll) => {
    try {
      updatePoll(updatedPoll.id, updatedPoll);
      toast.success("Poll updated successfully!");
      setShowEditPopup(false);
    } catch {
      toast.error("Failed to update poll. Please try again later.");
    }
  };

  const formik = useFormik({
    initialValues: {
      pollName: "",
      pollDesc: "",
      pollEndDate: "",
      pollFormLink: "",
      imgFile: "",
      excelFile: "",
    },
    validationSchema: pollValidationSchema,
    onSubmit: (values, { resetForm }) => {
      const newPoll = {
        ...values,
        pollFormLink: values.pollFormLink.includes("&lang=en")
          ? values.pollFormLink
          : values.pollFormLink + "&lang=en",
      };
      addPoll(newPoll);
      toast.success("New poll added successfully!");
      resetForm();
    },
  });

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

  const underway = Polls.filter((p) => new Date(p.pollEndDate) > new Date());
  const completed = Polls.filter((p) => new Date(p.pollEndDate) <= new Date());

  // Pagination for available Polls
  const availablePolls = underway;
  const paginatedAvailablePolls = availablePolls.slice(
    (availableCurrentPagePolls - 1) * PollsItemsPerPage,
    availableCurrentPagePolls * PollsItemsPerPage
  );
  const totalAvailablePollsPages = Math.ceil(
    availablePolls.length / PollsItemsPerPage
  );
  //------------------------
  // Pagination for completed Polls
  const completedPolls = completed;
  const paginatedCompletedPolls = completedPolls.slice(
    (completedCurrentPagePolls - 1) * PollsItemsPerPage,
    completedCurrentPagePolls * PollsItemsPerPage
  );
  const totalCompletedPollsPages = Math.ceil(
    completedPolls.length / PollsItemsPerPage
  );
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 Manage Surveys</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}><MdOutlinePendingActions fontSize={90}/>
        Underway Polls</h3>
        <table className={styles.pollTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>End Date</th>
              <th>Participants</th>
              <th>Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAvailablePolls.map((poll) => {
              const count = SubscribersOfPolls.filter(
                (s) => s.pollId === poll.id
              ).length;
              return (
                <tr key={poll.id}>
                  <td>{poll.pollName}</td>
                  <td>{poll.pollDesc}</td>
                  <td style={{ width: "15%" }}>{poll.pollEndDate}</td>
                  <td>{count}</td>
                  <td>{((count * 100) / users.length).toFixed(2)}%</td>
                  <td style={{ width: "10%" }}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(poll)}
                    >
                      <span style={{ marginLeft: "-5px" }}>✏️ Edit </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
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
                  availableCurrentPagePolls === i + 1 ? "#2e7d32" : "white",
                color: availableCurrentPagePolls === i + 1 ? "white" : "black",
                border:
                  availableCurrentPagePolls === i + 1 ? "#2e7d32" : "white",
              }}
              onClick={() => handleAvailablePagePollsChange(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{ fontWeight: "bold" }}>
          Number of Available Polls: {availablePolls.length}
        </p>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}><IoIosCloudDone fontSize={90} />&nbsp;
        Completed Polls</h3>
        <table className={styles.pollTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>End Date</th>
              <th>Participants</th>
              <th>Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompletedPolls.map((poll) => {
              const count = SubscribersOfPolls.filter(
                (s) => s.pollId === poll.id
              ).length;
              return (
                <tr key={poll.id}>
                  <td>{poll.pollName}</td>
                  <td>{poll.pollDesc}</td>
                  <td style={{ width: "15%" }}>{poll.pollEndDate}</td>
                  <td>{count}</td>
                  <td>{((count * 100) / users.length).toFixed(2)}%</td>
                  <td style={{ width: "12%" }}>
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
              );
            })}
          </tbody>
        </table>
      </section>
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
                completedCurrentPagePolls === i + 1 ? "#2e7d32" : "white",
                color: completedCurrentPagePolls === i + 1 ? "white" : "black",
                border:
                  completedCurrentPagePolls === i + 1 ? "#2e7d32" : "white",
              }}
              onClick={() => handleCompletedPagePollsChange(i + 1)}
              className={styles.paginationButton}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <p style={{ fontWeight: "bold" }}>
        Number Of Completed Polls: {completedPolls.length}
        </p>
      </div>
      <section className={styles.addSection}>
        <h3 className={styles.sectionTitle}> <IoIosAddCircle fontSize={"5rem"}/>
   <span>     Add New Poll </span></h3>

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
          />
          {formik.touched.pollFormLink && formik.errors.pollFormLink && (
            <div className="invalid-feedback">{formik.errors.pollFormLink}</div>
          )}

          <label htmlFor="imgFile">🖼 Survey image:</label>
          <input
            type="file"
            id="imgFile"
            name="imgFile"
            accept="image/*"
            onChange={handleImageChange}
            className={`form-control ${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
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

          <label htmlFor="excelFile">📊 External Excel Link:</label>
          <input
            type="text"
            id="excelFile"
            name="excelFile"
            placeholder="Enter external Excel link"
            value={formik.values.excelFile}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${formik.touched.excelFile && formik.errors.excelFile ? "is-invalid" : ""}`}
          />
          {formik.touched.excelFile && formik.errors.excelFile && (
            <div className="invalid-feedback">{formik.errors.excelFile}</div>
          )}
          {formik.values.excelFile && (
            <div className="mt-2">
              <strong>Link:</strong> {formik.values.excelFile}
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
       Add survey
          </button>
        </form>
      </section>

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

      {showEditPopup && (
        <PollEditPopup
          poll={selectedPoll}
          onSave={handleSave}
          onClose={() => setShowEditPopup(false)}
        />
      )}
      {showResultsPopup && (
        <PollResultsPopup
          poll={selectedResultsPoll}
          subscribers={SubscribersOfPolls.filter(
            (s) => s.pollId === selectedResultsPoll.id
          )}
          onClose={() => setShowResultsPopup(false)}
        />
      )}
    </div>
  );
}
