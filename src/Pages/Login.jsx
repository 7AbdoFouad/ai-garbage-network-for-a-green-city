import { useState } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../hooks/useUser";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./login.module.css";
import ForgetPassword from "./ForgotPassword";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .test("email-or-phone", "Enter a valid email", (value) => {
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return emailRegex.test(value);
    }),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const { login } = useAuth();
  const { users, managers, truckDrivers, registerUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: () => checkUser(),
  });

  const checkUser = async () => {
    const roles = [
      { data: users, roleName: "user" },
      { data: managers, roleName: "manager" },
      { data: truckDrivers, roleName: "truckDriver" },
    ];

    const foundUser = roles.find(({ data }) =>
      data.find(
        (user) =>
          user.email === formik.values.email &&
          user.password === formik.values.password
      )
    );

    if (foundUser) {
      const user = foundUser.data.find(
        (user) =>
          user.email === formik.values.email &&
          user.password === formik.values.password
      );

      login(user);
      navigate(`/${foundUser.roleName}Dashboard/${user.id}`);
      toast.success(
        `Login successful as ${foundUser.roleName}. Welcome ${user.name}`
      );
    } else {
      toast.error(
        "Login failed. Please check your email and password."
      );
    }
  };

  const handleGoogleLogin = async (response) => {
    const { credential } = response;
    const decoded = jwtDecode(credential);
    const userData = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      password: "google-auth",
      Address: "",
      profileImage: decoded.picture || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    };
    
    const alreadyExist = users.find((user) => user.email === userData.email);
    
    if (alreadyExist) {
      login(alreadyExist);
      navigate(`/userDashboard/${alreadyExist.id}`);
      toast.success(`Google Login Successful. Welcome ${alreadyExist.name}`);
      return;
    }
    
    await registerUser(userData);
    login(userData);
    navigate(`/userDashboard/${userData.id}`);
    toast.success(`Google Login Successful. Welcome ${userData.name}`);
  };

  const handleFacebookLogin = async (response) => {
    const userData = {
      id: response.id,
      name: response.name,
      email: response.email || `${response.id}@facebook.com`,
      password: "facebook-auth",
      Address: "",
      profileImage: response.picture?.data?.url || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    };
    
    const alreadyExist = users.find((user) => user.email === userData.email);
    
    if (alreadyExist) {
      login(alreadyExist);
      navigate(`/userDashboard/${alreadyExist.id}`);
      toast.success(`Facebook Login Successful. Welcome ${alreadyExist.name}`);
      return;
    }
    
    await registerUser(userData);
    login(userData);
    navigate(`/userDashboard/${userData.id}`);
    toast.success(`Facebook Login Successful. Welcome ${userData.name}`);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.gradientBackground}></div>
      
      <div className={styles.loginWrapper}>
        <div className={styles.illustrationContainer}>
          <img
            src="/src/Pages/UserPages/88.png"
            alt="Eco-friendly illustration"
            className={styles.illustration}
          />
        </div>

        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Welcome Back! 🌱</h2>
          </div>

          <div className={styles.cardBody}>
            <form onSubmit={formik.handleSubmit} className={styles.formContainer}>
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Email Address</label>
                <input
                  type="text"
                  className={`${styles.formInput} ${
                    formik.touched.email && formik.errors.email ? styles.inputError : ""
                  }`}
                  name="email"
                  placeholder="Enter email"
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
                  className={`${styles.formInput} ${
                    formik.touched.password && formik.errors.password ? styles.inputError : ""
                  }`}
                  name="password"
                  placeholder="••••••••"
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
                  <div className={styles.spinner}></div>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className={styles.forgotPassword}>
                <button
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
                <GoogleOAuthProvider clientId="346738253715-2niv19e5d3bdli28jsq05s6ictkk68ib.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error("Google login failed")}
                    render={({ onClick }) => (
                      <button
                        onClick={onClick}
                        className={`${styles.socialButton} ${styles.googleButton}`}
                      >
                        <svg className={styles.socialIcon} viewBox="0 0 24 24">
                          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 00-.146-1.788l-9.854-.973z" fill="#EA4335"/>
                          <path d="M5.576 8.456l2.855 2.102A5.997 5.997 0 0112.545 6c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2a9.996 9.996 0 00-8.97 5.5l1.001 1.956z" fill="#FBBC05"/>
                          <path d="M12.545 22c2.583 0 4.93-.988 6.704-2.596l-3.095-2.619a5.955 5.955 0 01-3.609 1.209 5.997 5.997 0 01-5.642-3.94l-1.002 1.954a9.996 9.996 0 008.644 5.992z" fill="#34A853"/>
                          <path d="M22.545 12c0-.814-.067-1.595-.195-2.346H12.545v4.639h5.642a5.53 5.53 0 01-2.399 3.646l3.095 2.619c1.83-1.732 2.962-4.296 2.962-7.558z" fill="#4285F4"/>
                        </svg>
                        Google
                      </button>
                    )}
                  />
                </GoogleOAuthProvider>

                           <FacebookLogin
                                         appId="649672187611943"
                                         autoLoad={false}
                                         fields="name,email,picture"
                                         callback={handleFacebookLogin}
                                         textButton="Continue with Facebook"
                                         icon="fa-facebook"
                                         cssClass="btn btn-primary w-100 mt-2"
                                        
                                       />
              </div>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.footerText}>
              New here?{" "}
              <a href="/registeration" className={styles.footerLink}>
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>

      {isEditing && (
        <ForgetPassword
          closeModal={() => setIsEditing(false)}
          className={styles.modalOverlay}
        />
      )}
    </div>
  );
}