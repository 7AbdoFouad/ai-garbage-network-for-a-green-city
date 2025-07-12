import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { object, string, ref } from "yup";
import styles from './ResetPassword.module.css';

const baseUrl = "https://greencityapi.runasp.net";

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
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token and email from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleResetPassword = async (values) => {
    if (!token || !email) {
      toast.error("Invalid reset link. Please try again.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('token', token);
      formData.append('newPassword', values.password);

      const res = await fetch(`${baseUrl}/api/Auth/reset-password`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          console.error("Error parsing response", e);
        }
        throw new Error(errorMessage);
      }

      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(`Failed to update password: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { password: "", repeatPassword: "" },
    validationSchema: schema,
    onSubmit: handleResetPassword,
  });

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