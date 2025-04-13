import React, { useState } from "react";
import useUser from "../../hooks/useUser";
import styles from "./PollsManagement.module.css";
import PollEditPopup from "./PollEditPopup";
import PollResultsPopup from "./PollResultsPopup";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// تسجيل مكونات Chart.js اللازمة للرسم البياني
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// مثال على مخطط التحقق من صحة نموذج الإضافة مع حقل External Excel Link
const pollValidationSchema = Yup.object({
  pollName: Yup.string()
    .required("Poll name is required")
    .min(3, "Poll name must be at least 3 characters"),
  pollDesc: Yup.string()
    .required("Poll description is required")
    .min(5, "Description must be at least 5 characters"),
  pollEndDate: Yup.date()
    .required("End date is required")
    .test("is-future", "The expiry date must be in the future", function (value) {
      return value > new Date();
    }),
  pollFormLink: Yup.string()
    .url("Invalid URL format")
    .required("Form link is required"),
  imgFile: Yup.mixed().required("Image is required"),
  excelFile: Yup.string()
    .required("Excel file link is required")
    .url("Invalid URL format")
});

export default function PollsManagement() {
  const { Polls, SubscribersOfPolls, deletePoll, updatePoll, users, addPoll } = useUser();
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedResultsPoll, setSelectedResultsPoll] = useState(null);
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // حالات لتحليل بيانات ملف Excel (في حال تم رفعه) – يبقى هذا القسم إذا كنت تحتاج لتحليل البيانات من أي ملف Excel خارجي يتم تحميله يدويًا
  const [excelData, setExcelData] = useState([]);
  const [questionResults, setQuestionResults] = useState({});
  const [questions, setQuestions] = useState([]);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newProfileImage = reader.result;
        try {
          formik.setFieldValue("imgFile", newProfileImage);
        } catch (error) {
          console.error("Failed to update profile image:", error);
          toast.error("An error occurred while updating the image.");
        }
      };
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to update poll. Please try again later.");
    }
  };

  // Formik لنموذج إضافة استفتاء جديد بما في ذلك حقل "excelFile" الذي يمثل رابط Excel الخارجي
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
      // التأكد من إضافة &lang=en إلى رابط الاستمارة
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

  // دالة لتحليل ملف Excel في حال تم رفع ملف Excel محلي (يمكن استخدامها عند الحاجة)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        // استخدام الورقة الأولى
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(jsonData);

        if (jsonData.length > 0) {
          // استخراج أسماء الأعمدة مع استثناء عمود "طابع زمني"
          const keys = Object.keys(jsonData[0]);
          const qs = keys.filter((key) => key !== "طابع زمني");
          setQuestions(qs);

          const aggregateResults = {};
          qs.forEach((q) => {
            aggregateResults[q] = {};
          });
          jsonData.forEach((row) => {
            qs.forEach((q) => {
              const answer = row[q];
              if (answer) {
                aggregateResults[q][answer] = (aggregateResults[q][answer] || 0) + 1;
              }
            });
          });
          setQuestionResults(aggregateResults);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className={styles.container}>
      <h2>📊 Manage surveys</h2>

      {/* جدول الاستفتاءات */}
      <table className={styles.pollTable}>
        <thead>
          <tr>
            <th>Poll Name</th>
            <th>Poll Description</th>
            <th>End Date</th>
            <th>Number of Participants</th>
            <th>Poll Status</th>
            <th>Participation Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Polls.map((poll) => {
            const participantsCount = SubscribersOfPolls.filter(
              (sub) => sub.pollId === poll.id
            ).length;
            const isActive = new Date(poll.pollEndDate) > new Date();
            return (
              <tr key={poll.id}>
                <td>{poll.pollName}</td>
                <td>{poll.pollDesc}</td>
                <td>{poll.pollEndDate}</td>
                <td>{participantsCount}</td>
                <td>{isActive ? "Underway" : "Over"}</td>
                <td>{((participantsCount * 100) / users.length).toFixed(2)}%</td>
                <td>
                  {isActive ? (
                    <button className={styles.editButton} onClick={() => handleEdit(poll)}>
                      ✏ Edit
                    </button>
                  ) : (
                    <>
                      <button
                        className={styles.viewResultsButton}
                        onClick={() => handleShowResults(poll)}
                      >
                        📊 Show Results
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(poll.id)}
                      >
                        🗑 Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Form لإضافة استفتاء جديد */}
      <h2>➕ Add a new survey</h2>
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
          ➕ Add survey
        </button>
      </form>

      {/* قسم عرض تحليل ملف Excel (إذا تم رفع ملف محليًا وتحليله) */}
      {questions.length > 0 && (
        <div className={styles.excelAnalysis}>
          <h2>Excel File Analysis</h2>
          {questions.map((question) => {
            const responses = questionResults[question];
            if (!responses) return null;
            const labels = Object.keys(responses);
            const values = Object.values(responses);
            const chartData = {
              labels,
              datasets: [
                {
                  label: question,
                  data: values,
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            };
            const options = {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: question,
                },
              },
            };
            return (
              <div key={question} style={{ marginBottom: "2rem" }}>
                <Bar data={chartData} options={options} />
              </div>
            );
          })}
        </div>
      )}

      {/* Popup تعديل الاستفتاء */}
      {showEditPopup && selectedPoll && (
        <PollEditPopup poll={selectedPoll} onSave={handleSave} onClose={() => setShowEditPopup(false)} />
      )}

      {/* Popup عرض نتائج الاستفتاء */}
      {showResultsPopup && selectedResultsPoll && (
        <PollResultsPopup
          poll={selectedResultsPoll}
          subscribers={SubscribersOfPolls.filter((sub) => sub.pollId === selectedResultsPoll.id)}
          onClose={() => setShowResultsPopup(false)}
        />
      )}
    </div>
  );
}
