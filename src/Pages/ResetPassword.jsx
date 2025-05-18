import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";
import { useParams } from "react-router-dom";
import { object, string, ref } from "yup";
import { useFormik } from "formik";
import styles from './ResetPassword.module.css';

const schema = object().shape({
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  repeatPassword: string()
    .required("Repeat Password is required")
    .oneOf([ref("password")], "Passwords must match"),
});

export default function ResetPassword() {
  const [submitting, setSubmitting] = useState(false);
  const { updateUser, fetchUser } = useUser();
  const [user, setUser] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (values) => {
    try {
      setSubmitting(true);
      if (user.password === values.password) {
        toast.error("New password cannot be the same as the old password.");
        return;
      }
      await updateUser(id, { ...user, password: values.password });
      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to update password. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { password: "", repeatPassword: "" },
    validationSchema: schema,
    onSubmit: handleResetPassword,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const userData = await fetchUser(id);
      setUser(userData);
    };
    fetchUsers();
  }, [id, fetchUser]);

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground}></div>
      
      <div className={styles.cardWrapper}>
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Reset Password 🔒</h2>
            <p className={styles.subtitle}>Create a new secure password</p>
          </div>

          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                New Password
                <input
                  type="password"
                  className={`${styles.input} ${
                    formik.touched.password && formik.errors.password ? styles.error : ""
                  }`}
                  name="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>
              {formik.touched.password && formik.errors.password && (
                <div className={styles.errorMessage}>{formik.errors.password}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Confirm Password
                <input
                  type="password"
                  className={`${styles.input} ${
                    formik.touched.repeatPassword && formik.errors.repeatPassword ? styles.error : ""
                  }`}
                  name="repeatPassword"
                  placeholder="••••••••"
                  value={formik.values.repeatPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </label>
              {formik.touched.repeatPassword && formik.errors.repeatPassword && (
                <div className={styles.errorMessage}>{formik.errors.repeatPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? (
                <div className={styles.spinner}></div>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate("/login")}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
 
      </div>
    </div>
  );
}