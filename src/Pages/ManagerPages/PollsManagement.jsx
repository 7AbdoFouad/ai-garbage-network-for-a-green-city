import React, { useState } from "react";
import useUser from "../../hooks/useUser";
import styles from "./PollsManagement.module.css";
import PollEditPopup from "./PollEditPopup";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

export default function PollsManagement() {
  const { Polls, SubscribersOfPolls, deletePoll, updatePoll, users, addPoll } = useUser();
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

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

  const handleSave = (updatedPoll) => {
    try {
      updatePoll(updatedPoll.id, updatedPoll);
      toast.success("Poll updated successfully!");
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update poll. Please try again later.");
    }
  };

  // Formik for adding new poll
  const formik = useFormik({
    initialValues: {
      pollName: "",
      pollDesc: "",
      pollEndDate: "",
      pollFormLink: "",
      imgFile: "",
    },
    validationSchema: Yup.object({
      pollName: Yup.string().required("Poll name is required").min(3, "Poll name must be at least 3 characters"),
      pollDesc: Yup.string().required("Poll description is required").min(5, "Description must be at least 5 characters"),
      pollEndDate: Yup.date().required("End date is required")
      .test(
        "is-future",
        "The expiry date must be in the future",
        function (value) {
          return value > new Date();
        }),
      pollFormLink: Yup.string().url("Invalid URL format").required("Form link is required"),
      imgFile: Yup.mixed().required("Image is required"),
    }),
    onSubmit: (values, { resetForm }) => {
       const newpoll={
        ...values,
        pollFormLink:values.pollFormLink+"&lang=en"
       }
      addPoll(newpoll);
      toast.success("New poll added successfully!");
      resetForm();
    },
  });

  return (
    <div className={styles.container}>
      <h2>📊 Manage surveys</h2>
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
            const participantsCount = SubscribersOfPolls.filter((sub) => sub.pollId === poll.id).length;
            return (
              <tr key={poll.id}>
                <td>{poll.pollName}</td>
                <td>{poll.pollDesc}</td>
                <td>{poll.pollEndDate}</td>
                <td>{participantsCount}</td>
                <td>{new Date(poll.pollEndDate) > new Date() ? "underway" : "over"}</td>
                <td>{(participantsCount * 100) / users.length}%</td>
                <td>
                  <button className={styles.editButton} onClick={() => handleEdit(poll)}>✏ Edit</button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(poll.id)}>🗑 Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 📌 Form for adding a new poll */}
      <h2>➕ Add a new survey</h2>
      <form onSubmit={formik.handleSubmit} className={styles.pollForm}>
        <label htmlFor="pollName">📌  Enter survey name:</label>
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

        <button type="submit" className={styles.submitButton}> ➕ Add survey</button>
      </form>

      {/* 📈 Past polls results */}
      <h2>📈 Previous surveys and results</h2>
      <div className={styles.pollResults}>
        {Polls.map((poll) =>
          new Date(poll.pollEndDate) < new Date() ? (
            <div key={poll.id} className={styles.pollResultCard}>
              <h3>{poll.pollName}</h3>
              <button className={styles.viewResultsButton}>📊 View Results</button>
            </div>
          ) : null
        )}
      </div>

      {showEditPopup && selectedPoll && (
        <PollEditPopup poll={selectedPoll} onSave={handleSave} onClose={() => setShowEditPopup(false)} />
      )}
</div>
);
}
