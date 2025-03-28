import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./EditProfileModal.module.css";
import { object, string } from "yup";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
const schema = object().shape({
    name: string()
      .required("Name is required")
      .min(3, "Name must be more than 3 characters")
      .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
      email: string()
      .required("Email is required")
      .matches(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Email is not valid"
      ),
    phone: string()
      .required("Phone number is required")
      .matches(/^\d+$/, "Phone number must contain only numbers")
      .length(11, "Phone number must be exactly 11 digits"),
    password: string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters "),
    Address: string()
      .min(3, "Address must be more than 3 characters"),
    truckNumber: string()
      .required("Truck Number is required")
      .matches(/^[0-9]+$/, "Invalid Truck Number, must contain only numbers")
  });


export default function EditTruckDriverModel({ userData, saveData, closeModal }) {

  const [submiting , setSubmiting] = useState(false);
  const formik = useFormik({
    initialValues: { name: "",email: "", phone: "",Address:"", password: "",truckNumber:"" },
    validationSchema: schema,

      onSubmit: async (data) => {  // ✅ Make it async
        setSubmiting(true); // ✅ Set submitting to true before saving
        try {
          await saveData(data); // ✅ Ensure saveData is awaited
        } catch (error) {
          console.log(error);
        } finally {
          setSubmiting(false); // ✅ This will now execute correctly after awaiting saveData
        }
      }
    });  
  useEffect(() => {
    formik.setValues({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      Address: userData.Address,
      password: userData.password,
      truckNumber:userData.truckNumber
    });
  }, []);
  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>✏️ تعديل الملف الشخصي</h3>
  <form  onSubmit={formik.handleSubmit}>
        <label htmlFor="USERNAME"className={styles.label}>اسم المستخدم:</label>
        <input
          type="text"
          name="name"
          id="USERNAME"
          placeholder="Enter Your Name"
          value={formik.values.name}
          onChange= {formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.name && formik.errors.name
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.name && formik.errors.name && (
          <div className="invalid-feedback">{formik.errors.name}</div>
        )}
        <label htmlFor="EMAIL" className={styles.label}>البريد الإلكتروني:</label>
        <input
          type="email"
          name="email"
          id="EMAIL"
          placeholder="Enter Your Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.email && formik.errors.email
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="invalid-feedback">{formik.errors.email}</div>
        )}
          
        <label  htmlFor="PHONE" className={styles.label}>رقم الهاتف:</label>
        <input
          type="text"
          name="phone"
          id="PHONE"
          placeholder="Enter Your Phone Number"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.phone && formik.errors.phone
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.phone && formik.errors.phone && (
          <div className="invalid-feedback">{formik.errors.phone}</div>
        )}
 
        <label htmlFor="ADDRESS" className={styles.label}>العنوان:</label>
        <input
          type="text"
          name="Address"
          id="ADDRESS"
          placeholder="Enter Your Address"
          value={formik.values.Address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.Address && formik.errors.Address
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.Address && formik.errors.Address && (
          <div className="invalid-feedback">{formik.errors.Address}</div>
        )}
        <label htmlFor="PASSWORD" className={styles.label}>كلمة المرور:</label>
        <input
          type="text"
          name="password"
          id="PASSWORD"
          placeholder="Enter Your Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}     
          className={`form-control ${styles.input} ${
            formik.touched.password && formik.errors.password
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="invalid-feedback">{formik.errors.password}</div>
        )}
        <label htmlFor="TRUCJDRIVER" className={styles.label}>رقم الشاحنة:</label>
        <input
          type="text"
          name="truckNumber"
          id="TRUCJDRIVER"
          placeholder="Enter Your Truck Number"
          value={formik.values.truckNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`form-control ${styles.input} ${
            formik.touched.truckNumber && formik.errors.truckNumber
              ? "is-invalid"
              : ""
          }`}
        />
        {formik.touched.truckNumber && formik.errors.truckNumber && (
          <div className="invalid-feedback">{formik.errors.truckNumber}</div>
        )}
          

        <div className={styles.modalButtons}>
          <button className={`${styles.button} ${submiting ? styles.disabled : styles.saveButton}`} type="submit" disabled={submiting}>
            {submiting ? "...جاري الحفظ" : " 💾 حفظ المعلومات"}
          </button>
          <button className={`${styles.button} ${styles.cancelButton}`} onClick={closeModal}>
            ❌ إلغاء
          </button>
        </div></form>
      </div>
    </div>
    );
}

EditTruckDriverModel.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    password: PropTypes.string,
    Address: PropTypes.string,
    truckNumber: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

