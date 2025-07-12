import  { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { object, string } from "yup";
import styles from "./ForgetPassword.module.css";

const baseUrl = "https://greencityapi.runasp.net";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
});

export default function ForgotPasswordModal({ closeModal }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [timer, setTimer] = useState(0);
  const [disableButton, setDisableButton] = useState(
    localStorage.getItem("resetEndTime") ? true : false
  );

  useEffect(() => {
    const endTime = localStorage.getItem("resetEndTime");
    if (endTime) {
      const remainingTime = Math.floor((parseInt(endTime) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setTimer(remainingTime);
        setDisableButton(true);
      } else {
        localStorage.removeItem("resetEndTime");
        setDisableButton(false);
      }
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      setDisableButton(true);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setDisableButton(false);
            localStorage.removeItem("resetEndTime");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setDisableButton(false);
    }
  }, [timer]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const newEndTime = Date.now() + 60000;
    localStorage.setItem("resetEndTime", newEndTime);
    setTimer(60);

    try {
      const formData = new FormData();
      formData.append("email", formik.values.email);
      formData.append("redirectUrl", "http://localhost:5173/reset-password");

      // Use the correct endpoint for requesting a reset link
      const res = await fetch(`${baseUrl}/api/Auth/forgot-password`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.text();
          if (errorData) errorMessage += ` - ${errorData}`;
        } catch (e) {
          console.error("Error parsing response", e);
        }
        throw new Error(errorMessage);
      }

      setSuccess("Password reset link sent. Please check your email.");
      toast.success("Password reset email sent successfully!");
    } catch (error) {
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>🔒 Forgot Password</h3>
        <p className={styles.description}>Enter your email to receive a password reset link</p>
        
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email address:</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.email && formik.errors.email ? styles.inputError : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorText}>{formik.errors.email}</div>
            )}
          </div>

          <div className={styles.modalButtons}>
            <button
              type="submit"
              className={`${styles.button} ${styles.sendButton} ${disableButton ? styles.disabledButton : ''}`}
              disabled={loading || disableButton}
            >
              {loading ? (
                <span className={styles.loadingIndicator}></span>
              ) : null}
              {loading
                ? "Sending..."
                : disableButton
                ? `Wait ${timer}s`
                : "Send Reset Link"}
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
        </form>
      </div>
    </div>
  );
}

ForgotPasswordModal.propTypes = {
  //not required,closeModal
  closeModal: PropTypes.func.isRequired,
};