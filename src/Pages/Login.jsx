import React, { useEffect, useState } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../hooks/useUser";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,8}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const [role, setRole] = useState("user");
  const { login } = useAuth();
  const { users, managers, truckDrivers } = useUser();
  const navigate = useNavigate();
  const {id}= useParams();
  const { fetchManager, fetchTruckDriver, fetchUser } = useUser();
  const formik = useFormik({
    initialValues: { email: "", password: "" },
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
        (user.email === formik.values.email || user.phone === formik.values.email) &&
        user.password === formik.values.password
    );

    if (check) {
      login(check);
      navigate(`/${role}Dashboard/${check.id}`);
      // if (role === "user") fetchUser(check.id);
      // else if (role === "manager") fetchManager(check.id);
      // else if (role === "truckdriver") fetchTruckDriver(check.id);
      toast.success(`Login successful as ${role}   Welcome ${check.name}`);
    } else {
      toast.error("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>

              {/* Role Selection */}
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

              {/* Login Form */}
              <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                  <label>Email address or Phone</label>
                  <input
                    type="text"
                    className="form-control"
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
              <div>
                forget password handling
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
