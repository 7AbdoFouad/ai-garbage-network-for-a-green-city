import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./EditProfileModal.module.css";
import { object, string } from "yup";
import { useFormik } from "formik";

const schema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  Address: string().min(3, "Address must be more than 3 characters"),
});

export default function EditProfileModal({ userData, saveData, closeModal }) {
  const formik = useFormik({
    initialValues: { name: "", Address: "", password: "" },
    validationSchema: schema,
    onSubmit: (data) => {
      console.log(data);
      saveData(data);
    },
  });

  useEffect(() => {
    formik.setValues({
      name: userData.name,
      Address: userData.Address,
      password: userData.password,
    });
  }, [userData]);

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ Edit Profile</h3>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="username" className={styles.label}>
            Username:
          </label>
          <input
            type="text"
            name="name"
            id="username"
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

          <label htmlFor="Address" className={styles.label}>
            Address:
          </label>
          <input
            type="text"
            name="Address"
            id="Address"
            placeholder="Enter Your Address"
            value={formik.values.Address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.Address && formik.errors.Address ? "is-invalid" : ""
            }`}
          />
          {formik.touched.Address && formik.errors.Address && (
            <div className="invalid-feedback">{formik.errors.Address}</div>
          )}

          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <input
            type="text"
            name="password"
            id="password"
            placeholder="Enter Your Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.password && formik.errors.password ? "is-invalid" : ""
            }`}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="invalid-feedback">{formik.errors.password}</div>
          )}

          <div className={styles.modalButtons}>
            <button
              className={`${styles.button} ${styles.saveButton}`}
              type="submit"
            >
              💾 Save Information
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
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
    username: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    password: PropTypes.string,
    Address: PropTypes.string,
  }).isRequired,
  saveData: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};