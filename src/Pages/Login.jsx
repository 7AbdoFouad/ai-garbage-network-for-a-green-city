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
import styles from "./Login.module.css";
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
  const { users, managers, truckDrivers,registerUser } = useUser();
  const navigate = useNavigate();
  // State for the modal
  const [isEditing, setIsEditing] = useState(false);
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: () => checkUser(),
  });
  // const sendHmacRequest = async (userId) => {
  //   try {
  //     await fetch("http://localhost:5000/generate-hmac", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ userId }),
  //     });
  //   } catch (error) {
  //     console.error("❌ Error sending HMAC request:", error);
  //   }
  // };

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
        "Login failed. Please check your email or phone and password."
      );
    }
  };

  // const handleGoogleLogin = (response) => {
  //   console.log("Google Login Success:", response);
  //   toast.success("Google Login Successful");
  // };
  const handleGoogleLogin = async (response) => {
    const { credential } = response;
    const decoded = jwtDecode(credential); // Decode JWT token to extract user info
  
    const userData = {
      id: decoded.sub, // Unique Google ID
      name: decoded.name,
      email: decoded.email,
      password: "google-auth", // No password needed for social login
      Address: "",
      profileImage: decoded.picture || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    };
    const areadyExist = users.find((user) => user.email === userData.email);
  
    if (areadyExist) {
      login(areadyExist);
      navigate(`/userDashboard/${areadyExist.id}`);
      toast.success(`Google Login Successful. Welcome ${areadyExist.name}`);
      return;
    }
  
    await registerUser(userData); // Store in DB
    login(userData);
    navigate(`/userDashboard/${userData.id}`);
    toast.success(`Google Login Successful. Welcome ${userData.name}`);
  };
  
  // const handleFacebookLogin = (response) => {
  //   console.log("Facebook Login Success:", response);
  //   toast.success("Facebook Login Successful");
  // };
  const handleFacebookLogin = async (response) => {
    const userData = {
      id: response.id, // Unique Facebook ID
      name: response.name,
      email: response.email || `${response.id}@facebook.com`, // Facebook sometimes doesn't provide email
      password: "facebook-auth",
      Address: "",
      profileImage: response.picture?.data?.url || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    };
  
    const areadyExist = users.find((user) => user.email === userData.email);
  
    if (areadyExist) {
      login(areadyExist);
      navigate(`/userDashboard/${areadyExist.id}`);
      toast.success(`Facebook Login Successful. Welcome ${areadyExist.name}`);
      return;
    }
  
    await registerUser(userData);
    login(userData);
    navigate(`/userDashboard/${userData.id}`);
    toast.success(`Facebook Login Successful. Welcome ${userData.name}`);
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-7">
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <h2 className="card-title text-center mb-4"
                >Login</h2>

                <form onSubmit={formik.handleSubmit}>
                  <div className="form-group">
                    <label>Email address</label>
                    <input
                      type="text"
                      className={`form-control p-3 rounded-3 ${styles.formControl}`}
                      name="email"
                      placeholder="Enter email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-danger">{formik.errors.email}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className={`form-control p-3 rounded-3 ${styles.formControl}`}
                      name="password"
                      placeholder="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-danger">{formik.errors.password}</p>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <button type="submit" className="btn btn-success w-100">
                      Login
                    </button>
                  </div>
                </form>
                <div className="mt-3 text-center">
                  <button
                    className="btn btn-link"
                    onClick={() => setIsEditing(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="text-center my-3">
                 <GoogleOAuthProvider clientId="346738253715-2niv19e5d3bdli28jsq05s6ictkk68ib.apps.googleusercontent.com">  {/* ✅ ضع Client ID هنا */}
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log("Login Failed!")}
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
          </div>

          <div className="col-lg-6 col-md-5 d-none d-md-block text-center">
            <img
              src="/src/Pages/UserPages/88.png"
              alt="Login Illustration"
              style={{
                maxWidth: "400px",
                height: "auto",
                borderRadius: "12px",
                marginLeft: "50px",
                marginTop: "29px"
              }}
            />
          </div>

        </div>
      </div>
            {isEditing && (
              <ForgetPassword
                closeModal={() => setIsEditing(false)}
              />
            )}
    </div>
  );
}
