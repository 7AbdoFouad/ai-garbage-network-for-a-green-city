import React, { useState } from "react";
import { useFormik } from "formik";
import { object, string } from "yup";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import useUser from "../../hooks/useUser";

const schema = object().shape({
  name: string().required("Name is required"),
  email: string()
    .required("Email is required")
    .email("Invalid email address"),
  message: string().required("Message is required").min(10, "Message is too short"),
});

export default function ContactUsPage() {
  const todayDate = new Date().toISOString().split("T")[0]; // Hidden field for date 
  const [submitting, setsubmitting] = useState(false);
  const { addContactUs } = useUser();
  const handleSubmit = async (e) => {
    try {
    setsubmitting(true); 
     await addContactUs(e);
      toast.success("Message sent successfully!");
      formik.resetForm();
    } catch (e) {
      console.log(e);
      toast.error("Failed to send message. Please try again later.");
    }finally {
        setsubmitting(false);
      }
  };
  const formik = useFormik({
    initialValues: { name: "", email: "", message: "", date: todayDate },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  
 

  return (
    <div className="container my-5" dir="ltr">
      {/* Logo & Navigation Bar Placeholder */}
      

      {/* Contact Form */}
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card shadow-lg">
            <div className="card-body">
              <h2 className="text-center mb-4">Contact Form</h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="form-group mb-3">
                  <label>Name:</label>
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
                  <label>Email:</label>
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
                  <label>Message:</label>
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
                <button
                type="submit"
                className={`btn btn-primary btn-block ${submitting && "disabled"} mt-3`}
              >
                Submit
              </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-5 text-center">
        <h3 className="mb-3">Contact Information</h3>
        <p><strong>Phone:</strong> 123-456-7890</p>
        <p><strong>Office Address:</strong> Ismailia</p>
        <p><strong>Email:</strong> info@cleancity.com</p>
      </div>
    </div>
  );
}
