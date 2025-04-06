import React, { useState } from "react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../Pages/UserPages/Contact.module.css";
import useUser from "../../hooks/useUser";
import { useParams } from "react-router-dom";

// 📌 Validation Schema
const schema = object().shape({
  name: string().required("Name is required"),
  email: string().required("Email is required").email("Invalid email address"),
  message: string()
    .required("Message is required")
    .min(10, "Message is too short"),
});

export default function ContactUsPage() {
  const todayDate = new Date().toISOString().split("T")[0];
  const [submitting, setSubmitting] = useState(false);
  const { addContactUs } = useUser();
  const {id}=useParams();
  

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
    initialValues: { name: "", email: "", message: "", todayDate: todayDate,userId:id },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.contactContainer}>
      <div className={`container ${styles.contactWrapper}`}>
        {/* 📌 Contact Form */}
        <div className={`${styles.contactForm} fadeIn`}>
          <div
            className={`${styles.contactCard} card shadow-lg p-5 rounded-4 border-0`}
          >
            <div className="card-body">
              <h2
                className={`text-center mb-4 text-success fw-bold ${styles.title}`}
              >
                📬 Contact Us
              </h2>
              <form onSubmit={formik.handleSubmit}>
                {/* Name Field */}
                <div className="form-group mb-3">
                  <label className="fw-semibold">Name:</label>
                  <input
                    type="text"
                    className={`form-control p-3 rounded-3 ${styles.formControl}`}
                    name="name"
                    placeholder="Enter your name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-danger fw-semibold mt-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group mb-3">
                  <label className="fw-semibold">Email:</label>
                  <input
                    type="email"
                    className={`form-control p-3 rounded-3 ${styles.formControl}`}
                    name="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-danger fw-semibold mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div className="form-group mb-3">
                  <label className="fw-semibold">Message:</label>
                  <textarea
                    className={`form-control p-3 rounded-3 ${styles.formControl}`}
                    name="message"
                    rows="5"
                    placeholder="Write your message here..."
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ resize: "none" }}
                  ></textarea>
                  {formik.touched.message && formik.errors.message && (
                    <p className="text-danger fw-semibold mt-1">
                      {formik.errors.message}
                    </p>
                  )}
                </div>

                {/* Hidden Field for Date */}
                <input type="hidden" name="date" value={todayDate} />

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className={`${styles.btnSubmit} mt-3 btn btn-success fw-bold px-4 py-2 rounded-3`}
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 📌 Right Side Image */}
        <div className={`${styles.contactImage} fadeIn`}>
          <img
            src="/src/Pages/UserPages/contact3.jpg"
            alt="Contact Us"
            className="img-fluid rounded-4 shadow-lg mb-4"
          />
          <h3 className="mb-3 text-success fw-bold">📞 Contact Information</h3>
          <p>
            <strong>📱 Phone:</strong> 123-456-7890
          </p>
          <p>
            <strong>🏢 Office Address:</strong> Ismailia
          </p>
          <p>
            <strong>✉️ Email:</strong> info@cleancity.com
          </p>
        </div>
      </div>

      {/* 📌 Contact Info */}
      {/* <div className={`${styles.contactInfo} shadow-lg fadeIn p-4 rounded-4 mt-4 bg-light text-center`}>
        <h3 className="mb-3 text-success fw-bold">📞 Contact Information</h3>
        <p><strong>📱 Phone:</strong> 123-456-7890</p>
        <p><strong>🏢 Office Address:</strong> Ismailia</p>
        <p><strong>✉️ Email:</strong> info@cleancity.com</p>
      </div> */}
    </div>
  );
}
