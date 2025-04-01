import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./PollEditPopup.module.css";
import { object, string, date, mixed } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = object().shape({
  pollName: string().required("Poll name is required").min(3, "Poll name must be at least 3 characters"),
  pollDesc: string().required("Poll description is required").min(5, "Description must be at least 5 characters"),
  pollEndDate: date().required("End date is required"),
  pollFormLink: string().url("Invalid URL format").required("Form link is required"),
  imgFile: mixed().required("Image is required"),
  
});

export default function PollEditPopup({ poll, onSave, onClose }) {
  const formik = useFormik({
    initialValues: { pollName: "", pollDesc: "", pollEndDate: "", pollFormLink: "",imgFile: "", },
    validationSchema: schema,
    onSubmit: (data) => {
        const correctFormLink = data.pollFormLink.includes("&lang=en") ? data.pollFormLink : data.pollFormLink + "&lang=en";
        const updatedData = {
       ...poll,
        ...data,
        pollFormLink: correctFormLink,
      };

        console.log("Form data:", updatedData); // Debugging log
      onSave(updatedData);
    },
  });
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
  useEffect(() => {
    if (poll) {
      formik.setValues({
        pollName: poll.pollName || "",
        pollDesc: poll.pollDesc || "",
        pollEndDate: poll.pollEndDate ? new Date(poll.pollEndDate).toISOString().split("T")[0] : "",
        pollFormLink: poll.pollFormLink || "",
        imgFile: poll.imgFile || "",
      });
    }

    document.body.style.overflow = "hidden"; // 🚫 منع تمرير الصفحة الرئيسية
  
    return () => {
      document.body.style.overflow = "auto"; // ✅ إعادة التمرير عند إغلاق الـ popup
    };
  }, [poll]);

  if (!poll) return null; // Prevent rendering if poll is not available

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Edit Poll</h3>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="pollName" className={styles.label}>Poll Name:</label>
          <input
            type="text"
            name="pollName"
            id="pollName"
            placeholder="Enter Poll Name"
            value={formik.values.pollName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${formik.touched.pollName && formik.errors.pollName ? "is-invalid" : ""}`}
          />
          {formik.touched.pollName && formik.errors.pollName && (
            <div className="invalid-feedback">{formik.errors.pollName}</div>
          )}

          <label htmlFor="pollDesc" className={styles.label}>Poll Description:</label>
          <textarea
  name="pollDesc"
  id="pollDesc"
  placeholder="Enter Poll Description"
  value={formik.values.pollDesc}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  className={`form-control ${styles.input} ${
    formik.touched.pollDesc && formik.errors.pollDesc ? "is-invalid" : ""
  }`}
  style={{ height: "150px", resize: "none" }} // Set fixed height and disable resizing
/>

          {formik.touched.pollDesc && formik.errors.pollDesc && (
            <div className="invalid-feedback">{formik.errors.pollDesc}</div>
          )}

          <label htmlFor="pollEndDate" className={styles.label}>End Date:</label>
          <input
            type="date"
            name="pollEndDate"
            id="pollEndDate"
            value={formik.values.pollEndDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${formik.touched.pollEndDate && formik.errors.pollEndDate ? "is-invalid" : ""}`}
          />
          {formik.touched.pollEndDate && formik.errors.pollEndDate && (
            <div className="invalid-feedback">{formik.errors.pollEndDate}</div>
          )}

          <label htmlFor="pollFormLink" className={styles.label}>Form Link:</label>
          <input
            type="text"
            name="pollFormLink"
            id="pollFormLink"
            placeholder="Enter Form Link"
            value={formik.values.pollFormLink}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${formik.touched.pollFormLink && formik.errors.pollFormLink ? "is-invalid" : ""}`}
          />
          {formik.touched.pollFormLink && formik.errors.pollFormLink && (
            <div className="invalid-feedback">{formik.errors.pollFormLink}</div>
          )}
<label htmlFor="imgFile">🖼️ صورة الاستطلاع:</label>
        <input
          type="file"
          id="imgFile"
          name="imgFile"
          accept="image/*"
          onChange={handleImageChange}
          className={`form-control ${styles.input}${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
        />
        {formik.touched.imgFile && formik.errors.imgFile && (
          <div className="invalid-feedback">{formik.errors.imgFile}</div>
        )}
           {formik.values.imgFile && (
              <div className="mt-2">
                <img
                  src={formik.values.imgFile}
                  alt="Uploaded"
                  width="200"
                  className={`img-thumbnail `}
                  style={{ maxWidth: "100%", height: "auto" ,background:"#1bad1d"}} // Adjust the size as needed
                />
              </div>
            )}
          <div className={styles.modalButtons}>
            <button className={`${styles.button} ${styles.saveButton}`} type="submit">
              💾 Save Poll
            </button>
            <button className={`${styles.button} ${styles.cancelButton}`} type="button" onClick={onClose}>
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PollEditPopup.propTypes = {
  poll: PropTypes.shape({
    pollName: PropTypes.string,
    pollDesc: PropTypes.string,
    pollEndDate: PropTypes.string,
    pollFormLink: PropTypes.string,
    imgFile: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
