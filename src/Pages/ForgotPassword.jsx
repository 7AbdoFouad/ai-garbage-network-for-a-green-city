import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";
import { useFormik } from "formik";
import { object, string } from "yup";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [timer, setTimer] = useState(0);
  const [disableButton, setDisableButton] = useState(false);

  const { users } = useUser();
  const navigate = useNavigate();

  // ✅ عند تحميل الصفحة، نحسب الوقت المتبقي بناءً على `endTime` المخزن في `localStorage`
  useEffect(() => {
    const endTime = localStorage.getItem("resetEndTime");
    if (endTime) {
      const remainingTime = Math.floor((parseInt(endTime) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setTimer(remainingTime);
        setDisableButton(true);
      } else {
        localStorage.removeItem("resetEndTime");
        setDisableButton(false);
      }
    }
  }, []);

  // ✅ تحديث العداد وعرض الوقت المتبقي
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setDisableButton(false);
            localStorage.removeItem("resetEndTime");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleSubmit = async () => {
    const user = users.find((user) => user.email === formik.values.email);

    if (!user) {
      toast.error("User not found.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDisableButton(true);
    
    const newEndTime = Date.now() + 60000; // ✅ حساب وقت انتهاء المؤقت بعد 60 ثانية
    localStorage.setItem("resetEndTime", newEndTime);
    
    setTimer(60); // ✅ تعيين العداد إلى 60 ثانية

    try {
      const res = await fetch("http://localhost:5000/forget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }

      setSuccess("Password reset link sent. Please check your email.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                  <label>Email address </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-danger">{formik.errors.email}</div>
                  )}
                </div>
                <div className="text-center mt-3">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading || disableButton}>
                    {loading ? "Sending..." : disableButton ? `Please wait ${timer}s` : "Send Reset Link"}
                  </button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                  {success && <div className="text-success mt-2">{success}</div>}
                </div>
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
