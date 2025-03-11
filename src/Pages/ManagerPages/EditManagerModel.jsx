import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./EditProfileModal.module.css";
import { object, string, array } from "yup";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import useUser from "../../hooks/useUser";
import { useState } from "react";

const schema = object().shape({
  name: string()
    .required("Name is required")
    .min(3, "Name must be more than 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  phone: string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only numbers")
    .length(11, "Phone number must be exactly 11 digits"),
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters "),
  Address: string().min(3, "Address must be more than 3 characters"),
  Permissions: array()
  .of(string().required("Permission is required"))
});
// {
//   "name": "Mohamed zeid",
//   "email": "Hb6mW@example.com",
//   "phone": "01055748421",
//   "password": "66666666",
//   "Address": "الاسماعلية - المستقبل",
//   "Permissions": [
//     "admin"
//   ]
// }

export default function EditManagerModel({ userData, saveData, closeModal }) {
  const { fetchManager } = useUser();
  const [currentManager, setCurrentManager] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchmanager = async () => {
      const manager = await fetchManager(id);
      setCurrentManager(manager);
    };
    fetchmanager();
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      Address: "",
      Permissions: [],
    },
    validationSchema: schema,
    onSubmit: (data) => {
      console.log(data);
      saveData(data);
    },
  });
  useEffect(() => {
    formik.setValues({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      Address: userData.Address,
      Permissions: userData.Permissions,
    });
  }, []);
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updatedPermissions = checked
      ? [...formik.values.Permissions, value] // Add if checked
      : formik.values.Permissions.filter((perm) => perm !== value); // Remove if unchecked
  
    formik.setFieldValue("Permissions", updatedPermissions);
  };
  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>✏️ تعديل معلومات المدير</h3>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="username" className={styles.label}>
            اسم المدير:
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
          <label htmlFor="email" className={styles.label}>
            البريد الإلكتروني:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter Your Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control ${styles.input} ${
              formik.touched.email && formik.errors.email ? "is-invalid" : ""
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="invalid-feedback">{formik.errors.email}</div>
          )}

          <label htmlFor="phone" className={styles.label}>
            رقم الهاتف:
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Enter Your Phone Number"
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

          <label htmlFor="Address" className={styles.label}>
            العنوان:
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
              formik.touched.Address && formik.errors.Address
                ? "is-invalid"
                : ""
            }`}
          />
          {formik.touched.Address && formik.errors.Address && (
            <div className="invalid-feedback">{formik.errors.Address}</div>
          )}
          <label htmlFor="password" className={styles.label}>
            كلمة المرور:
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
              formik.touched.password && formik.errors.password
                ? "is-invalid"
                : ""
            }`}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="invalid-feedback">{formik.errors.password}</div>
          )}
          <label htmlFor="Permissions" className={styles.label}>
            الصلاحيات:
          </label>
          {/* chexkbox */}
          <div className={styles.checkboxContainer}>
            <div
              className={styles.checkboxItem}
              style={{
                display: !currentManager?.Permissions?.includes("admin")
                  ? "none"
                  : "block",
              }}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="admin"
                onChange={handleCheckboxChange}
                id="admin"
                checked={formik.values.Permissions.includes("admin")}
              />
              <label htmlFor="admin">مدير عام</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="ManageTrucks"
                onChange={handleCheckboxChange}
                id="ManageTrucks"
                checked={formik.values.Permissions.includes("ManageTrucks")}
              />
              <label htmlFor="ManageTrucks">مدير شاحنات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="ManageAnnouncement"
                onChange={handleCheckboxChange}
                id="ManageAnnouncement"
                checked={formik.values.Permissions.includes("ManageAnnouncement")}
              />
              <label htmlFor="ManageAnnouncement">مدير بلاغات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="ManageReportsAndDataAnalysis"
                onChange={handleCheckboxChange}
                id="ManageReportsAndDataAnalysis"
                checked={formik.values.Permissions.includes("ManageReportsAndDataAnalysis")}
              />
              <label htmlFor="ManageReportsAndDataAnalysis">مدير تقارير وتحليل البيانات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="CommunityEngagementManagement"
                onChange={handleCheckboxChange}
                id="CommunityEngagementManagement"
                checked={formik.values.Permissions.includes("CommunityEngagementManagement")}
              />
              <label htmlFor="CommunityEngagementManagement">مدير  فعاليات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="UserManagement"
                onChange={handleCheckboxChange}
                id="UserManagement"
                checked={formik.values.Permissions.includes("UserManagement")}
              />
              <label htmlFor="UserManagement">مدير  مستخدمين</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="PollsManagement"
                onChange={handleCheckboxChange}
                id="PollsManagement"
                checked={formik.values.Permissions.includes("PollsManagement")}
              />
              <label htmlFor="PollsManagement">مدير  استطلاعات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="RewardsManagement"
                onChange={handleCheckboxChange}
                id="RewardsManagement"
                checked={formik.values.Permissions.includes("RewardsManagement")}
              />
              <label htmlFor="RewardsManagement">مدير  مكافئات</label>
            </div>
            <div
              className={styles.checkboxItem}
            >
              <input
                type="checkbox"
                name="Permissions"
                value="WasteBinManagement"
                onChange={handleCheckboxChange}
                id="WasteBinManagement"
                checked={formik.values.Permissions.includes("WasteBinManagement")}
              />
              <label htmlFor="WasteBinManagement">مدير  صناديق نفايات</label>
            </div>

          </div>
          {formik.touched.Permissions && formik.errors.Permissions && (
            <div className="invalid-feedback">{formik.errors.Permissions}</div>
          )}
          <div className={styles.modalButtons}>
            <button
              className={`${styles.button} ${styles.saveButton}`}
              type="submit"
            >
              💾 حفظ المعلومات
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={closeModal}
            >
              ❌ إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditManagerModel.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    password: PropTypes.string,
    Address: PropTypes.string,
    Permissions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};
