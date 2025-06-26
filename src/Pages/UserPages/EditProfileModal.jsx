import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./EditProfileModal.module.css";
import { object, string } from "yup";
import { useFormik } from "formik";

const schema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  phone: string()
    .required("Phone is required")
    .matches(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  address: string()
    .required("Address is required")
    .min(3, "Address must be at least 3 characters"),
});

export default function EditProfileModal({ userData, updateUserProfile, closeModal }) {
  const formik = useFormik({
    initialValues: { 
      name: userData.name || "", 
      phone: userData.phone || "", 
      address: userData.address || "" 
    },
    validationSchema: schema,
    onSubmit: async (data) => {
      try {
        await updateUserProfile(data);
        closeModal();
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      name: userData.name || "",
      phone: userData.phone || "",
      address: userData.address || ""
    });
  }, [userData]);

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Edit Profile</h3>
        <form onSubmit={formik.handleSubmit}>
          {/* Name Field */}
          <label htmlFor="name" className={styles.label}>
            Name:
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter Your Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.name && formik.errors.name ? "is-invalid" : ""
            }`}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="invalid-feedback">{formik.errors.name}</div>
          )}

          {/* Phone Field */}
          <label htmlFor="phone" className={styles.label}>
            Phone:
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="Enter Your Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
            }`}
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="invalid-feedback">{formik.errors.phone}</div>
          )}

          {/* Address Field */}
          <label htmlFor="address" className={styles.label}>
            Address:
          </label>
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Enter Your Address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.address && formik.errors.address ? "is-invalid" : ""
            }`}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="invalid-feedback">{formik.errors.address}</div>
          )}

          <div className={styles.modalButtons}>
            <button
              className={`${styles.button} ${styles.saveButton}`}
              type="submit"
              style={{marginRight:"10px",marginTop:"10px"}}
            >
              💾 Save Information
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              type="button"
              onClick={closeModal}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProfileModal.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
  updateUserProfile: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};