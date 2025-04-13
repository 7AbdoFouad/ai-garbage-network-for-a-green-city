import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ActivityEditPopup.module.css";
import {string,object,mixed,number} from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const schema = object().shape({
  ActName: string().required("اسم النشاط مطلوب"),
  ActDescription: string()
    .required("الوصف مطلوب")
    .min(10, "الوصف يجب ان يكون على الاقل 10 حروف"),
  actIntervalDate: string()
    .required("الفترة الزمنية مطلوبة")
    .matches(
      /^\d{4}-\d{2}-\d{2} - \d{4}-\d{2}-\d{2}$/,
      "يجب أن تكون الفترة الزمنية بالتنسيق YYYY-MM-DD - YYYY-MM-DD"
    )
    .test(
      "is-future",
      "يجب أن تكون الفترة الزمنية في المستقبل",
      function (value) {
        const [start, end] = value.split(" - ").map((date) => new Date(date));
        const today = new Date();
        return start > today && end > today;
      }
    ),
  imgFile: mixed().required("صورة النشاط مطلوبة"),
  NumOfRequiredSubscribers:number().required(
    "عدد المشتركين المطلوبين مطلوب"
  ),
});

export default function EditCommunityActivity({ activity, onSave, onClose }) {
  const formik = useFormik({
    initialValues: {
      ActName: "",
      ActDescription: "",
      actIntervalDate: "",
      NumOfRequiredSubscribers: "",
      imgFile: "",
    },
    validationSchema: schema,
    onSubmit: (data) => {
      const updatedData = { ...activity, ...data };
      console.log("Form data:", updatedData); // Debugging log
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
        ActName: activity.ActName || "",
        ActDescription: activity.ActDescription || "",
        actIntervalDate: activity.actIntervalDate || "",
        NumOfRequiredSubscribers: activity.NumOfRequiredSubscribers || 1,
        imgFile: activity.imgFile || "",
      });
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activity]);

  if (!activity) {
    console.log("Activity not found");
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
            Activity Interval:
          </label>
          <input
            type="text"
            name="actIntervalDate"
            id="actIntervalDate"
            value={formik.values.actIntervalDate}
            onChange={formik.handleChange}
            className={`form-control ${styles.input} ${formik.touched.actIntervalDate && formik.errors.actIntervalDate ? "is-invalid" : ""}`}
            onBlur={formik.handleBlur}
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
            className={`form-control ${styles.input}${formik.touched.imgFile && formik.errors.imgFile ? "is-invalid" : ""}`}
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
            <button className={`${styles.button} ${styles.saveButton}`} type="submit" style={{marginRight:"10px",marginTop:"10px"}}>
              💾 Save
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              type="button"
              onClick={onClose}
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
    ActName: PropTypes.string,
    ActDescription: PropTypes.string,
    actIntervalDate: PropTypes.string,
    actstate: PropTypes.string,
    imgFile: PropTypes.string,
    NumOfSubscribers: PropTypes.number,
    NumOfRequiredSubscribers: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
