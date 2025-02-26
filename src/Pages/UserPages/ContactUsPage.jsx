import React, { useState } from "react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../Pages/UserPages/Contact.module.css";
import useUser from "../../hooks/useUser";

// 📌 Validation Schema
const schema = object().shape({
  name: string().required("Name is required"),
  email: string().required("Email is required").email("Invalid email address"),
  message: string().required("Message is required").min(10, "Message is too short"),
});

export default function ContactUsPage() {
  const todayDate = new Date().toISOString().split("T")[0];
  const [submitting, setSubmitting] = useState(false);
  const { addContactUs } = useUser();

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await addContactUs(values);
      toast.success("Message sent successfully!");
      formik.resetForm();
    } catch (e) {
      console.log(e);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { name: "", email: "", message: "", date: todayDate },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.contactContainer}>
      <div className="container">
        {/* 📌 Contact Form */}
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10 fadeIn">
            <div className={`${styles.contactCard} card shadow-lg`}>
              <div className="card-body">
                <h2 className={`text-center mb-4 ${styles.title}`}>📬 Contact Us</h2>
                <form onSubmit={formik.handleSubmit}>
                  {/* Name Field */}
                  <div className="form-group mb-3">
                    <label className="fw-semibold">Name:</label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      name="name"
                      placeholder="Enter your name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-danger">{formik.errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-group mb-3">
                    <label className="fw-semibold">Email:</label>
                    <input
                      type="email"
                      className={`form-control ${styles.formControl}`}
                      name="email"
                      placeholder="Enter your email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-danger">{formik.errors.email}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="form-group mb-3">
                    <label className="fw-semibold">Message:</label>
                    <textarea
                      className={`form-control ${styles.formControl}`}
                      name="message"
                      rows="4"
                      placeholder="Write your message here..."
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

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      className={`${styles.btnSubmit} mt-3`}
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* 📌 Contact Info */}
        <div className={`${styles.contactInfo} shadow-lg fadeIn`}>
          <h3 className="mb-3 text-primary">📞 Contact Information</h3>
          <p><strong>📱 Phone:</strong> 123-456-7890</p>
          <p><strong>🏢 Office Address:</strong> Ismailia</p>
          <p><strong>✉️ Email:</strong> info@cleancity.com</p>
        </div>
      </div>
    </div>
  );
}
