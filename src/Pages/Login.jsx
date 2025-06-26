import { useState, useEffect } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./login.module.css";
import ForgetPassword from "./ForgotPassword";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .email("Enter a valid email"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: () => checkUser(),
  });

  const checkUser = async () => {
    try {
      const email = formik.values.email.trim();
      const password = formik.values.password.trim();
      if (!email || !password) throw new Error("Both fields are required.");

      const payload = {
        EmailAddress: email,
        Password: password,
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      const response = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : null;
        const message =
          validationErrors || data.message || data.title || "Login failed.";
        throw new Error(message);
      }
      
      if (!data.jwtToken) throw new Error("Authentication token missing.");

      // Pass credentials to login function for storage
      await login(data.jwtToken, email, password);
      setLoginAttempted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
  useEffect(() => {
    if (!isLoading && user && loginAttempted) {
      const role = user.role;
      if (role === "User") {
        navigate(`/userDashboard/`);
      } else if (role === "TruckDriver") {
        navigate(`/truckDriverDashboard/`);
      } else {
        navigate(`/managerDashboard/`);
      }
      setLoginAttempted(false);
    }
  }, [user, isLoading, loginAttempted, navigate]);
  const handleGoogleLogin = () => {
    // handle Google OAuth response here
  };

  const handleFacebookLogin = () => {
    // handle Facebook OAuth response here
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.gradientBackground} />
      <div className={styles.loginWrapper}>
        <div className={styles.illustrationContainer}>
          <img
            src="/src/Pages/UserPages/88.png"
            alt="Eco-friendly illustration"
            className={styles.illustration}
          />
        </div>

        <div className={styles.authCard}>
          <header className={styles.cardHeader}>
            <h2 className={styles.title}>Welcome Back! 🌱</h2>
          </header>

          <div className={styles.cardBody}>
            <form onSubmit={formik.handleSubmit} className={styles.formContainer}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Email Address</label>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter email"
                  className={`${styles.formInput} ${
                    formik.touched.email && formik.errors.email ? styles.inputError : ""
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className={styles.errorMessage}>{formik.errors.email}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`${styles.formInput} ${
                    formik.touched.password && formik.errors.password ? styles.inputError : ""
                  }`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className={styles.errorMessage}>{formik.errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <div className={styles.spinner} />
                ) : (
                  "Sign In"
                )}
              </button>

              <div className={styles.forgotPassword}>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => setIsEditing(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            <div className={styles.socialAuth}>
              <div className={styles.socialDivider}>
                <span className={styles.dividerText}>Or continue with</span>
              </div>
              <div className={styles.socialButtons}>
                <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error("Google login failed")}
                    render={({ onClick }) => (
                      <button
                        onClick={onClick}
                        className={`${styles.socialButton} ${styles.googleButton}`}
                      >
                        Google
                      </button>
                    )}
                  />
                </GoogleOAuthProvider>

                <FacebookLogin
                  appId="YOUR_FACEBOOK_APP_ID"
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={handleFacebookLogin}
                  textButton="Continue with Facebook"
                  cssClass={`btn btn-primary w-100 mt-2 ${styles.facebookButton}`}
                />
              </div>
            </div>
          </div>

          <footer className={styles.cardFooter}>
            <p className={styles.footerText}>
              New here?{' '}
              <a href="/registration" className={styles.footerLink}>
                Create an account
              </a>
            </p>
          </footer>
        </div>
      </div>
      {isEditing && <ForgetPassword closeModal={() => setIsEditing(false)} />}
    </div>
  );
}
