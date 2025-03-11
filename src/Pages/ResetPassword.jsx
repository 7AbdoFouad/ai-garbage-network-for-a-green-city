import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";
import { useParams } from "react-router-dom";
import { object, string, ref } from "yup"; // Ensure you import Yup correctly
import { useFormik } from "formik";

const schema = object().shape({
  password: string().required("Password is required").min(8, "Password must be at least 8 characters long"),
  repeatPassword: string()
    .required("Repeat Password is required")
    .oneOf([ref("password")], "Passwords must match"),
});

export default function ResetPassword() {
  const [submitting, setSubmitting] = useState(false);
  const {updateUser,fetchUser} = useUser();
  const [user , setUser]=useState({});
  const {id}= useParams();
  const handleResetPassword =async (e) => {
    try {
       setSubmitting(true);
       if (user.password === formik.values.password) {
        toast.error("New password cannot be the same as the old password.");
        setSubmitting(false);
        return;
      }
       await updateUser(id, { ...user, password:e.password });
       toast.success("Password updated successfully.");
       setSubmitting(false);
        navigate("/login");
     } catch (e) {
       console.log(e);
       toast.error("Failed to update password. Please try again later.");
     } finally {
       setSubmitting(false);
     }
};

  const formik = useFormik({
    initialValues: {
      password: "",
      repeatPassword: "",
    },
    validationSchema: schema,
    onSubmit: handleResetPassword,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const user = await fetchUser(id);
      setUser(user);
    };
    fetchUsers();
  }, [id]);
  const navigate = useNavigate();


  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Password</h2>
              <form onSubmit={formik.handleSubmit}>
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
                {submitting ? "Submitting..." : "update Password"}
              </button>
              </form>
              <div className="mt-3 text-center">
                <button className="btn btn-link" onClick={() => navigate("/login")}>
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
