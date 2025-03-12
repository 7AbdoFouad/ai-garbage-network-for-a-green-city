import React from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../hooks/useUser";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
import { GoogleOAuthProvider } from "@react-oauth/google";

const schema = object().shape({
  email: string()
    .required("Email or phone number is required")
    .test("email-or-phone", "Enter a valid email or phone number", (value) => {
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
  const { users, managers, truckDrivers } = useUser();
  const navigate = useNavigate();

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
        "Login failed. Please check your email or phone and password."
      );
    }
  };

  // Google Login Success Handler
  const handleGoogleLogin = (response) => {
    console.log("Google Login Success:", response);
    toast.success("Google Login Successful");
    // Here, you should validate the user and log them in
    // login(user);
  };

  // Facebook Login Success Handler
  const handleFacebookLogin = (response) => {
    console.log("Facebook Login Success:", response);
    toast.success("Facebook Login Successful");
    // Here, you should validate the user and log them in
    // login(user);
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>

              <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                  <label>Email address </label>
                  <input
                    type="text"
                    className="form-control"
                    name="email"
                    placeholder="Enter email or phone number"
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
                    className="form-control"
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
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="text-center my-3">
                <GoogleOAuthProvider clientId="346738253715-2niv19e5d3bdli28jsq05s6ictkk68ib.apps.googleusercontent.com">
                  {" "}
                  {/* ✅ ضع Client ID هنا */}
                  <GoogleLogin
                    onSuccess={(response) =>
                      console.log("Login Success!", response)
                    }
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
    </div>
  );
}
