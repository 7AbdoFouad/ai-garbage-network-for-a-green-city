import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ActivityEditPopup.module.css";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";

// Helper functions for date conversion
const convertDMYToYMD = (dmyString) => {
  if (!dmyString) return "";
  const parts = dmyString.split(" - ");
  if (parts.length !== 2) return dmyString;

  const convertPart = (dmy) => {
    const [day, month, year] = dmy.split("/");
    return `${year}-${month}-${day}`;
  };

  return `${convertPart(parts[0])} - ${convertPart(parts[1])}`;
};

const convertYMDToDMY = (ymdString) => {
  if (!ymdString) return "";
  const parts = ymdString.split(" - ");
  if (parts.length !== 2) return ymdString;

  const convertPart = (ymd) => {
    const [year, month, day] = ymd.split("-");
    return `${day}/${month}/${year}`;
  };

  return `${convertPart(parts[0])} - ${convertPart(parts[1])}`;
};

// Validation schema
const schema = Yup.object().shape({
  ActName: Yup.string().required("Activity name is required"),
  ActDescription: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  actIntervalDate: Yup.string()
       .required("Time interval is required")
      //  .matches(
      //    /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/,
      //    "Time interval must be in the format DD/MM/YYYY - DD/MM/YYYY"
      //  )
      //  .test("is-future", "Time interval must be in the future", function (value) {
      //    if (!value) return false;
         
      //    const [startStr, endStr] = value.split(" - ");
      //    if (!startStr || !endStr) return false;
         
      //    // Convert DD/MM/YYYY to Date object
      //    const convertToDate = (dmy) => {
      //      const [day, month, year] = dmy.split('/');
      //      return new Date(`${year}-${month}-${day}`);
      //    };
         
      //    const start = convertToDate(startStr);
      //    const end = convertToDate(endStr);
      //    const today = new Date();
      //    today.setHours(0, 0, 0, 0);
         
      //    return start > today && end > today;
      //  }),
  ,imgFile: Yup.mixed().required("Activity image is required"),
  NumOfRequiredSubscribers: Yup.number()
    .required("Number of required subscribers is required")
    .min(1, "Must have at least 1 subscriber")
});

export default function EditCommunityActivity({ activity, onSave, onClose }) {
  const formik = useFormik({
    initialValues: {
      ActName: "",
      ActDescription: "",
      actIntervalDate: "",
      NumOfRequiredSubscribers: 1,
      imgFile: "",
    },
    validationSchema: schema,
    onSubmit: (data) => {
      // Convert date back to backend format (DD/MM/YYYY)
      const convertedData = {
        ...data,
        actIntervalDate: data.actIntervalDate
      };
      
      const updatedData = { 
        ...activity, 
        ...convertedData,
        actName: convertedData.ActName,
        actDescription: convertedData.ActDescription,
        numOfRequiredSubscribers: convertedData.NumOfRequiredSubscribers,
        photo: convertedData.imgFile
      };
      
      onSave(updatedData);
    },
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          formik.setFieldValue("imgFile", reader.result);
        } catch (error) {
          console.error("Failed to update image:", error);
          toast.error("An error occurred while updating the image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (activity) {
      formik.setValues({
        ActName: activity.actName || "",
        ActDescription: activity.actDescription || "",
        actIntervalDate: (activity.actIntervalDate) || "",
        NumOfRequiredSubscribers: activity.numOfRequiredSubscribers || 1,
        imgFile: activity.photo || "",
      });
    }
    
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activity]);

  if (!activity) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>✏️ Edit Activity</h3>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="ActName" className={styles.label}>
            Activity Name:
          </label>
          <input
            type="text"
            name="ActName"
            id="ActName"
            value={formik.values.ActName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${formik.touched.ActName && formik.errors.ActName ? "is-invalid" : ""}`}
          />
          {formik.touched.ActName && formik.errors.ActName && (
            <div className="invalid-feedback">{formik.errors.ActName}</div>
          )}

          <label htmlFor="ActDescription" className={styles.label}>
            Description:
          </label>
          <textarea
            name="ActDescription"
            id="ActDescription"
            value={formik.values.ActDescription}
            onChange={formik.handleChange}
            className={`form-control ${styles.input} ${formik.touched.ActDescription && formik.errors.ActDescription ? "is-invalid" : ""}`}
            style={{ height: "150px", resize: "none" }}
            onBlur={formik.handleBlur}
          />
          {formik.touched.ActDescription && formik.errors.ActDescription && (
            <div className="invalid-feedback">{formik.errors.ActDescription}</div>
          )}

          <label htmlFor="actIntervalDate" className={styles.label}>
            Activity Interval (DD/MM/YYYY - DD/MM/YYYY):
          </label>
          <input
            type="text"
            name="actIntervalDate"
            id="actIntervalDate"
            value={formik.values.actIntervalDate}
            onChange={formik.handleChange}
            className={`form-control ${styles.input} ${formik.touched.actIntervalDate && formik.errors.actIntervalDate ? "is-invalid" : ""}`}
            onBlur={formik.handleBlur}
            placeholder="01/09/2025 - 15/09/2025"
          />
          {formik.touched.actIntervalDate && formik.errors.actIntervalDate && (
            <div className="invalid-feedback">{formik.errors.actIntervalDate}</div>
          )}

          <label htmlFor="NumOfRequiredSubscribers" className={styles.label}>
            Required Subscribers:
          </label>
          <input
            type="number"
            name="NumOfRequiredSubscribers"
            id="NumOfRequiredSubscribers"
            value={formik.values.NumOfRequiredSubscribers}
            onChange={formik.handleChange}
            className={`form-control ${styles.input} ${formik.touched.NumOfRequiredSubscribers && formik.errors.NumOfRequiredSubscribers ? "is-invalid" : ""}`}
            onBlur={formik.handleBlur}
            min="1"
          />
          {formik.touched.NumOfRequiredSubscribers && formik.errors.NumOfRequiredSubscribers && (
            <div className="invalid-feedback">{formik.errors.NumOfRequiredSubscribers}</div>
          )}
          
          <label htmlFor="imgFile" className={styles.label}>
            Image:
          </label>
          <input
            type="file"
            id="imgFile"
            name="imgFile"
            accept="image/*"
            onChange={handleImageChange}
            className={`form-control ${styles.input} ${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
            onBlur={formik.handleBlur}
          />
          {formik.touched.imgFile && formik.errors.imgFile && (
            <div className="invalid-feedback">{formik.errors.imgFile}</div>
          )}
          
          {formik.values.imgFile && (
            <img
              src={formik.values.imgFile}
              alt="Uploaded"
              width="200"
              className="img-thumbnail mt-2"
              style={{ maxWidth: "100%", height: "auto" ,background:"#1bad1d"}} // Adjust the size as needed
            />
          )}
          
 
          <div className={styles.modalButtons}>

            <button className={`${styles.button} ${styles.saveButton} ${formik.isSubmitting ? styles.disabled : ""}`} type="submit" style={{marginRight:"10px",marginTop:"10px"}}>
              {formik.isSubmitting ? "Saving..." : "💾 Save"}
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}${formik.isSubmitting ? styles.disabled : ""}`}
              type="button"
              onClick={onClose}              disabled={formik.isSubmitting}

            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditCommunityActivity.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    actName: PropTypes.string,
    actDescription: PropTypes.string,
    actIntervalDate: PropTypes.string,
    actState: PropTypes.string,
    photo: PropTypes.string,
    numOfSubscribers: PropTypes.number,
    numOfRequiredSubscribers: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};