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

const styles = `
  .auth-container {
    background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
    min-height: 100vh;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    width: 100%;
    max-width: 500px;
  }

  .auth-header {
    background: linear-gradient(45deg, #2baf2b, #8bc34a);
    padding: 2rem;
    color: white;
    text-align: center;
    position: relative;
  }

  .auth-header h3 {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;
    font-size: 1.8rem;
  }

  .auth-header::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: #fff;
    clip-path: polygon(50% 50%, 0 0, 100% 0);
  }

  .form-group label {
    font-weight: 600;
    color: #2d6a4f;
    margin-bottom: 0.5rem;
    display: block;
  }

  .form-control {
    border: 2px solid #e3f2e5;
    border-radius: 10px;
    padding: 12px 20px;
    transition: all 0.3s ease;
    width: 100%;
    font-size: 1rem;
  }

  .form-control:focus {
    border-color: #8bc34a;
    box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
    outline: none;
  }



  .btn-primary {
    background: #0d6efd;
    border: none;
    padding: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    width: 100%;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  .btn-primary:hover {
    background: #0d6efd;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .social-divider {
    position: relative;
    margin: 2rem 0;
    color: #6c757d;
    text-align: center;
    font-size: 0.9rem;
  }

  .social-divider::before,
  .social-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #dee2e6;
  }

  .social-divider::before { left: 0; }
  .social-divider::after { right: 0; }

  .social-btn {
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
  }

  .social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .google-btn {
    background: #34a853;
    color: white;
  }

 

  .spinner-border {
    margin-right: 8px;
  }

  .login-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #2d6a4f;
  }

  .login-link a {
    color: #2baf2b;
    text-decoration: none;
    font-weight: 600;
  }

  .login-link a:hover {
    text-decoration: underline;
  }
`;

export default function Registration() {
  const [submitting, setSubmitting] = useState(false);
  const { registerUser, users, managers, truckDrivers } = useUser();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      if (truckDrivers.find((truckDriver) => truckDriver.email === values.email)) {
        toast.error("Email already exists");
        setSubmitting(false);
        return;
      }

      const res = await registerUser({
        ...values,
        Address: values.Address || "",
        profileImage: values.profileImage || "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
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

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      repeatPassword: "",
      Address: "",
      profileImage: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
      numOfAcceptedAnnouncementsCount: 0,
      numOfCompletedActivitiesCount: 0,
      numOfCompletedPollsCount: 0,
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="auth-container">
      <style>{styles}</style>
      <div className="auth-card">
        <div className="auth-header">
          <h3>Create Account</h3>
        </div>
        <div className="p-4 p-md-5">
          <form onSubmit={formik.handleSubmit}>
            <div className="form-group mb-4">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.name && formik.errors.name ? "is-invalid" : ""
                }`}
                id="name"
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

            <div className="form-group mb-4">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                className={`form-control ${
                  formik.touched.email && formik.errors.email ? "is-invalid" : ""
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

            <div className="form-group mb-4">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className={`form-control ${
                  formik.touched.password && formik.errors.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback">{formik.errors.password}</div>
              )}
            </div>

            <div className="form-group mb-4">
              <label htmlFor="repeatPassword">Repeat Password</label>
              <input
                type="password"
                className={`form-control ${
                  formik.touched.repeatPassword && formik.errors.repeatPassword ? "is-invalid" : ""
                }`}
                id="repeatPassword"
                name="repeatPassword"
                placeholder="Repeat Password"
                value={formik.values.repeatPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.repeatPassword && formik.errors.repeatPassword && (
                <div className="invalid-feedback">{formik.errors.repeatPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-success ${submitting ? "disabled" : ""}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="social-divider">Or continue with</div>

          <div className="social-buttons">
            <GoogleOAuthProvider clientId="346738253715-2niv19e5d3bdli28jsq05s6ictkk68ib.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
                render={({ onClick }) => (
                  <button onClick={onClick} className="social-btn google-btn">
                    <i className="fab fa-google" />
                    Continue with Google
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

          <p className="login-link">
            Already have an account?{" "}
            <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}