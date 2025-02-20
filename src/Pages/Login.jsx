import React, { useEffect } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import useUser from "../hooks/useUser";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import  useAuth  from "../hooks/useAuth";

const schema = object().shape({
  email: string()
    .required("Email is Required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is Required")
    .min(8, "Password must be more than 8 characters"),
});

export default function Login() {
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: () => checkUser(),
  });
  const { login } = useAuth();
  const { users } = useUser();

  const navigate = useNavigate();

  const checkUser = async () => {
    const check = users.find(
      (user) =>
        user.email === formik.values.email &&
        user.password === formik.values.password
    );
    if (check) {
      login(check);
      navigate("/TodoListPage/" + check.id);
      toast.success("Login Success");
    } else {
      toast.error("Login Failed , Please Check Your Email and Password");
    }
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
                  <label htmlFor="exampleInputEmail1">Email address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
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
                  <label htmlFor="exampleInputPassword1">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="password"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-danger">{formik.errors.password}</p>
                  )}
                </div>
                <div className="text-center  mt-2">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
