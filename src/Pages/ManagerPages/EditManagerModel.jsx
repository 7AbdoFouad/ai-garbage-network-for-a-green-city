import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./EditManagerModel.module.css";
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
  .min(1, "At least one permission is required"),});
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
    document.body.style.overflow = "hidden"; // 🚫 منع تمرير الصفحة الرئيسية
  
    return () => {
      document.body.style.overflow = "auto"; // ✅ إعادة التمرير عند إغلاق الـ popup
    };
  }, []);
  useEffect(() => {
    const fetchmanager = async () => {
      const manager = await fetchManager(id);
      setCurrentManager(manager);
    };
    fetchmanager();
  });
  const [submiting , setSubmiting] = useState(false);

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
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      Address: userData.Address,
      Permissions: userData.Permissions||[],
    });
  }, []);
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updatedPermissions = checked
      ? [...formik.values.Permissions, value] // Add if checked
      : formik.values.Permissions.filter((perm) => perm !== value); // Remove if unchecked
    formik.setFieldValue("Permissions", updatedPermissions);
    if(updatedPermissions.length==0)
    formik.touched.Permissions = true;
  }
  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>✏️ تعديل معلومات المدير</h3>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="UserName" className={styles.label}>
            اسم المدير:
          </label>
          <input
            type="text"
            name="name"
            id="UserName"
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
          <label htmlFor="Email" className={styles.label}>
            البريد الإلكتروني:
          </label>
          <input
            type="email"
            name="email"
            id="Email"
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

          <label htmlFor="Phone" className={styles.label}>
            رقم الهاتف:
          </label>
          <input
            type="text"
            name="phone"
            id="Phone"
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

          <label htmlFor="ADdress" className={styles.label}>
            العنوان:
          </label>
          <input
            type="text"
            name="Address"
            id="ADdress"
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
          <label htmlFor="Password" className={styles.label}>
            كلمة المرور:
          </label>
          <input
            type="text"
            name="password"
            id="Password"
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
          <label htmlFor="permissions" className={styles.label}>
            الصلاحيات:
          </label>
          {/* chexkbox */}
          <div className={`${styles.checkboxContainer}   ${
                        formik.touched.Permissions && formik.errors.Permissions
                          ? "is-invalid"
                          : ""
                      }`}>
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
                id="Admin"
                
                checked={formik.values.Permissions.includes("admin")}
              />
              <label htmlFor="Admin">مدير عام</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="ManageTrucks"
                onChange={handleCheckboxChange}
                id="manageTrucks"
                checked={formik.values.Permissions.includes("ManageTrucks")}
              />
              <label htmlFor="manageTrucks">مدير شاحنات</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="ManageAnnouncement"
                onChange={handleCheckboxChange}
                id="manageAnnouncement"
                checked={formik.values.Permissions.includes(
                  "ManageAnnouncement"
                )}
              />
              <label htmlFor="manageAnnouncement">مدير بلاغات</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="ManageReportsAndDataAnalysis"
                onChange={handleCheckboxChange}
                id="manageReportsAndDataAnalysis"
                checked={formik.values.Permissions.includes(
                  "ManageReportsAndDataAnalysis"
                )}
              />
              <label htmlFor="manageReportsAndDataAnalysis">
                مدير تقارير وتحليل البيانات
              </label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="CommunityEngagementManagement"
                onChange={handleCheckboxChange}
                id="communityEngagementManagement"
                checked={formik.values.Permissions.includes(
                  "CommunityEngagementManagement"
                )}
              />
              <label htmlFor="communityEngagementManagement">
                مدير فعاليات
              </label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="UserManagement"
                onChange={handleCheckboxChange}
                id="userManagement"
                checked={formik.values.Permissions.includes("UserManagement")}
              />
              <label htmlFor="userManagement">مدير مستخدمين</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="PollsManagement"
                onChange={handleCheckboxChange}
                id="pollsManagement"
                checked={formik.values.Permissions.includes("PollsManagement")}
              />
              <label htmlFor="pollsManagement">مدير استطلاعات</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="RewardsManagement"
                onChange={handleCheckboxChange}
                id="rewardsManagement"
                checked={formik.values.Permissions.includes(
                  "RewardsManagement"
                )}
              />
              <label htmlFor="rewardsManagement">مدير مكافئات</label>
            </div>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                name="Permissions"
                value="WasteBinManagement"
                onChange={handleCheckboxChange}
                id="wasteBinManagement"
                checked={formik.values.Permissions.includes(
                  "WasteBinManagement"
                )}
              />
              <label htmlFor="wasteBinManagement">مدير صناديق نفايات</label>
            </div>
          </div>
          {formik.touched.Permissions && formik.errors.Permissions && (
  <div className="invalid-feedback ">{formik.errors.Permissions}</div>
)}
          <div className={styles.modalButtons}>
          <button className={`${styles.button} ${submiting ? styles.disabled : styles.saveButton}`} type="submit" disabled={submiting}>
            {submiting ? "...جاري الحفظ" : " 💾 حفظ المعلومات"}
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
