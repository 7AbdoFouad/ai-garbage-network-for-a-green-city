import React, { useState } from "react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Contact.module.css";
import Cookies from "js-cookie";

// 📌 Validation Schema
const schema = object().shape({
  name: string().required("Name is required"),
  email: string().required("Email is required").email("Invalid email address"),
  message: string()
    .required("Message is required")
    .min(10, "Message is too short"),
});

export default function ContactUsPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        EmailAddress: "Admin123@example.com",
        Password: "Admin@12345",
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      const response2 = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });      const data = await response2.json();
      const tok=data.jwtToken;
      // console.log("Authentication token:", tok);
      const res2= await fetch("/api/Users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tok}`,
          "Content-Type": "application/json"
        }
      });
            const allusers = await res2.json();

      const storedCredentials = localStorage.getItem("authCredentials");
      const { email, password } = JSON.parse(storedCredentials);
      // search for user by email
      const user = allusers.find((user) => user.email === email);
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("message", values.message);
      
      // Get token from cookies
      const token = Cookies.get("token");
      
      const response = await fetch("/api/ContactUs", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
      
      toast.success("Message sent successfully!");
      formik.resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: { name: "", email: "", message: "" },
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
    </div>
  );
}