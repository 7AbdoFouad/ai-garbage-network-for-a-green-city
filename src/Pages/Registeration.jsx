import React, { useState } from "react";
import { object, string , ref } from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";
import { useNavigate, useParams } from "react-router-dom";

const schema = object().shape({
  name: string()
    .required("Name is Required")
    .min(3, "Name must be more than 3 Characters")
    .matches("[a-zA-Z]", "Invalid Name, must contain letters only"),
  email: string()
    .required("Email is Required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,}))$/,
      "Email is not valid"
    ),
  password: string()
    .required("Password is Required")
    .min(8, "Password must be more than 8 characters"),
  repeatPassword: string().required("Repeat Password is Required").oneOf([ref("password")], "Password must match"),
});

export default function Registeration() {
  const [submitting, setsubmitting] = useState(false);
  const { registerUser } = useUser();
  const navigate = useNavigate();

  const handleSupmit = async (e) => {
    try {
      setsubmitting(true);
      const res = await registerUser({ email: e.email, name: e.name, password: e.password});
      navigate("/TodoListPage/"+res.id);
      console.log(res);
      toast.success("Registeration Completed");
    } catch (e) {
      console.log(e);
      toast.error("Failed to register user");
    } finally {
      setsubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", repeatPassword: "" },
    validationSchema: schema,
    onSubmit: handleSupmit,
  });

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-6">
          <div className="card p-4 shadow">
            <h3 className="text-center mb-4">Register</h3>
            <form onSubmit={formik.handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">User Name</label>
                <input
                  type="text"
                  className={`form-control ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`}
                  id="username"
                  aria-describedby="nameHelp"
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
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input
                  type="text"
                  className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
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
              <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input
                  type="password"
                  className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`}
                  id="exampleInputPassword1"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="password"
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="invalid-feedback">{formik.errors.password}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="checkInputPassword1">Repeat Password</label>
                <input
                  type="password"
                  className={`form-control ${
                    formik.touched.repeatPassword && formik.errors.repeatPassword ? "is-invalid" : ""
                  }`}
                  id="checkInputPassword1"
                  placeholder="Repeat Password"
                  value={formik.values.repeatPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="repeatPassword"
                />
                {formik.touched.repeatPassword && formik.errors.repeatPassword && (
                  <div className="invalid-feedback">{formik.errors.repeatPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-block ${submitting && "disabled"} mt-3`}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}