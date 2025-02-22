import React, { useState } from "react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const schema = object().shape({
  name: string().required("الاسم مطلوب"),
  email: string()
    .required("البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صالح"),
  message: string().required("الرسالة مطلوبة"),
});

export default function ContactUsPage() {
  const todayDate = new Date().toISOString().split("T")[0]; // Hidden field for date

  const formik = useFormik({
    initialValues: { name: "", email: "", message: "" },
    validationSchema: schema,
    onSubmit: (values) => {
      console.log({ ...values, date: todayDate });
      toast.success("تم إرسال رسالتك بنجاح!");
    },
  });

  return (
    <div className="container my-5" dir="rtl">
      {/* Logo & Navigation Bar Placeholder */}
      <div className="text-center mb-4">
        <img src="/src/Pages/UserPages/clean-green-city-vector-illustration-concept-flat-style-73462400.webp" alt="الشعار" className="mb-3" style={{ width: "120px" }} />
        <nav className="navbar navbar-light bg-light rounded p-2">
          <span className="navbar-brand mx-auto">نفس الشريط اللي فوق</span>
        </nav>
      </div>

      {/* Contact Form */}
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card shadow-lg">
            <div className="card-body">
              <h2 className="text-center mb-4">نموذج تواصل</h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="form-group mb-3">
                  <label>الاسم:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-danger">{formik.errors.name}</p>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>البريد الإلكتروني:</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-danger">{formik.errors.email}</p>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label>الرسالة:</label>
                  <textarea
                    className="form-control"
                    name="message"
                    rows="4"
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.message && formik.errors.message && (
                    <p className="text-danger">{formik.errors.message}</p>
                  )}
                </div>

                {/* Hidden Field for Date */}
                <input type="hidden" name="date" value={todayDate} />

                <div className="text-center">
                  <button type="submit" className="btn btn-success w-100">
                    إرسال
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-5 text-center">
        <h3 className="mb-3">معلومات الاتصال</h3>
        <p><strong>الهاتف:</strong> 123-456-7890</p>
        <p><strong>عنوان المكتب:</strong> الإسماعيلية</p>
        <p><strong>البريد الإلكتروني:</strong> info@cleancity.com</p>
      </div>
    </div>
  );
}
