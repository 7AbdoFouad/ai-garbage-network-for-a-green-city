import React, { useState } from "react";
import { object, string, ref } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
// 📌 Validation Schema
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

  password: string()
    .required("Password is required")
    .min(8, "Password must be more than 8 characters"),
  repeatPassword: string()
    .required("Repeat Password is required")
    .oneOf([ref("password")], "Passwords must match"),
});

export default function Registeration() {
  const [submitting, setSubmitting] = useState(false);
  const { registerUser, users, managers, truckDrivers } = useUser();
  const navigate = useNavigate();
    const { login } = useAuth();
  
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
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (users.find((user) => user.email === values.email)) {
        toast.error("Email already exists");
        setSubmitting(false);
        return;
      }
      if (managers.find((manager) => manager.email === values.email)) {
        toast.error("Email already exists");
        setSubmitting(false);
        return;
      }
      if (
        truckDrivers.find((truckDriver) => truckDriver.email === values.email)
      ) {
        toast.error("Email already exists");
        setSubmitting(false);
        return;
      }

      const res = await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        Address: values.Address,
        profileImage: values.profileImage,
        numOfAcceptedAnnouncementsCount: values.numOfAcceptedAnnouncementsCount,
        numOfCompletedActivitiesCount: values.numOfCompletedActivitiesCount,
        numOfCompletedPollsCount: values.numOfCompletedPollsCount,
      });
      navigate(`/userDashboard/${res.id}`);
      toast.success(`Registration successful! Welcome, ${res.name}`);
    } catch (e) {
      console.log(e);
      toast.error("Failed to register user");
    } finally {
      setSubmitting(false);
    }
  };
  // const handleSubmit = async (values) => {
  //   try {
  //     setSubmitting(true);

  //     // Step 1: Send Verification Email
  //     const response = await fetch("http://localhost:5000/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email: values.email, name: values.name }),
  //     });

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error);

  //     toast.success("Verification email sent! Please check your inbox.");
  //   } catch (e) {
  //     console.log(e);
  //     toast.error("Failed to send verification email.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      repeatPassword: "",
      Address: "",
      profileImage:
        "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-6">
          <div className="card p-4 shadow">
            <h3 className="text-center mb-4">Register</h3>
            <form onSubmit={formik.handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="username">User Name</label>
                <input
                  type="text"
                  className={`form-control ${
                    formik.touched.name && formik.errors.name
                      ? "is-invalid"
                      : ""
                  }`}
                  id="username"
                  name="name"
                  placeholder="Enter Your Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="invalid-feedback">{formik.errors.name}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="text"
                  className={`form-control ${
                    formik.touched.email && formik.errors.email
                      ? "is-invalid"
                      : ""
                  }`}
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="invalid-feedback">{formik.errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className={`form-control ${
                    formik.touched.password && formik.errors.password
                      ? "is-invalid"
                      : ""
                  }`}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="invalid-feedback">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Repeat Password Field */}
              <div className="form-group">
                <label htmlFor="repeatPassword">Repeat Password</label>
                <input
                  type="password"
                  className={`form-control ${
                    formik.touched.repeatPassword &&
                    formik.errors.repeatPassword
                      ? "is-invalid"
                      : ""
                  }`}
                  id="repeatPassword"
                  name="repeatPassword"
                  placeholder="Repeat Password"
                  value={formik.values.repeatPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.repeatPassword &&
                  formik.errors.repeatPassword && (
                    <div className="invalid-feedback">
                      {formik.errors.repeatPassword}
                    </div>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`btn btn-primary btn-block mt-3 ${
                  submitting && "disabled"
                }`}
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Submit"}
              </button>
            </form>
            <div className="text-center">OR</div>
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
    </div>
  );
}
