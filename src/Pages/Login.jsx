import React, { useEffect, useState } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../hooks/useUser";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const schema = object().shape({
  emailOrPhone: string()
    .required("Email or phone number is required")
    .test("email-or-phone", "Enter a valid email or phone number", (value) => {
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const phoneRegex = /^[0-9]{10,15}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const [role, setRole] = useState("user");
  const { login } = useAuth();
  const { users, managers, truckDrivers } = useUser();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { emailOrPhone: "", password: "" },
    validationSchema: schema,
    onSubmit: () => checkUser(),
  });

  const checkUser = async () => {
    let db;
    if (role === "user") db = users;
    else if (role === "manager") db = managers;
    else db = truckDrivers;

    const check = db.find(
      (user) =>
        (user.email === formik.values.emailOrPhone ||
          user.phone === formik.values.emailOrPhone) &&
        user.password === formik.values.password
    );

    if (check) {
      login(check);
      navigate(`/${role}Dashboard/${check.id}`);
      toast.success(`Login successful as ${role}. Welcome ${check.name}`);
    } else {
      toast.error("Login failed. Please check your email or phone and password.");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>

              <div className="form-group mb-3">
                <label>Select Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="truckdriver">Truck Driver</option>
                </select>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                  <label>Email address or Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="emailOrPhone"
                    placeholder="Enter email or phone number"
                    value={formik.values.emailOrPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.emailOrPhone && formik.errors.emailOrPhone && (
                    <p className="text-danger">{formik.errors.emailOrPhone}</p>
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
                <button className="btn btn-link" onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
