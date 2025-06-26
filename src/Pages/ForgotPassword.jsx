// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { toast } from "react-toastify";
// import { useFormik } from "formik";
// import { object, string } from "yup";
// import styles from "./ForgetPassword.module.css"; // ملف CSS خاص بالتصميم
// import useUser from "../hooks/useUser";

// const schema = object().shape({
//   email: string()
//     .required("Email is required")
//     .matches(
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//       "Email is not valid"
//     ),
// });

// export default function ForgotPasswordModal({ closeModal }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [timer, setTimer] = useState(0);
//   const [disableButton, setDisableButton] = useState(
//     localStorage.getItem("resetEndTime") ? true : false
//   );
//       const { users } = useUser();

//   // ✅ حساب الوقت المتبقي عند تحميل المودال
//   useEffect(() => {

//     const endTime = localStorage.getItem("resetEndTime");
//     if (endTime) {
//       const remainingTime = Math.floor((parseInt(endTime) - Date.now()) / 1000);
//       if (remainingTime > 0) {
//         setTimer(remainingTime);
//         setDisableButton(true);
//       } else {
//         localStorage.removeItem("resetEndTime");
//         setDisableButton(false);
//       }
//     }


//   }, []);

//   // ✅ تحديث العداد كل ثانية
//   useEffect(() => {
//     if (timer > 0) {
//       setDisableButton(true); // ✅ اجعل الزر معطلاً عندما يكون هناك عد تنازلي
//       const countdown = setInterval(() => {
//         setTimer((prev) => {
//           if (prev === 1) {
//             clearInterval(countdown);
//             setDisableButton(false); // ✅ تفعيل الزر عند انتهاء العداد
//             localStorage.removeItem("resetTimer"); // ✅ حذف المؤقت من التخزين المحلي
//           }
//           return prev - 1;
//         });
//       }, 1000);
  
//       return () => clearInterval(countdown);
//     } else {
//       setDisableButton(false); // ✅ تأكد أن الزر مفعل عند تحميل الصفحة إذا لم يكن هناك عد تنازلي
//     }
//   }, [timer]);

//   const handleSubmit = async () => {
//     const user = users.find((user) => user.email === formik.values.email);

//     if (!user) {
//       toast.error("User not found.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);
//     setDisableButton(true);

//     const newEndTime = Date.now() + 60000;
//     localStorage.setItem("resetEndTime", newEndTime);
//     setTimer(60);

//     try {
//       const res = await fetch("http://localhost:5000/forget", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: user.email, id: user.id }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.message || "Failed to send email.");
//       }

//       setSuccess("Password reset link sent. Please check your email.");
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formik = useFormik({
//     initialValues: { email: "" },
//     validationSchema: schema,
//     onSubmit: handleSubmit,
//   });

//   return (
//     <div className={styles.overlay} onClick={closeModal}>
//       <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
//         <h3 className={styles.title}>🔒 Forgot Password</h3>
//         <form onSubmit={formik.handleSubmit}>
//           <label className={styles.label}>Email address:</label>
//           <input
//             type="text"
//             name="email"
//             placeholder="Enter your email"
//             value={formik.values.email}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             className={`form-control ${styles.input} ${
//               formik.touched.email && formik.errors.email ? "is-invalid" : ""
//             }`}
//           />
//           {formik.touched.email && formik.errors.email && (
//             <div className="invalid-feedback">{formik.errors.email}</div>
//           )}

//           <div className={styles.modalButtons}>
//             <button
//               type="submit"
//               className={`${styles.button} ${!disableButton? styles.sendButton : "disabled"}`}
//               disabled={loading || disableButton}
//             >
//               {loading
//                 ? "Sending..."
//                 : disableButton
//                 ? `Wait ${timer}s`
//                 : "Send Reset Link"}
//             </button>
//             <button
//               className={`${styles.button} ${styles.cancelButton}`}
//               onClick={closeModal}
//             >
//               ❌ Cancel
//             </button>
//           </div>
//           {error && <div className="text-danger mt-2">{error}</div>}
//           {success && <div className="text-success mt-2">{success}</div>}
//         </form>
//       </div>
//     </div>
//   );
// }

// ForgotPasswordModal.propTypes = {
//   closeModal: PropTypes.func.isRequired,
//   users: PropTypes.array.isRequired,
// };

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import useUser from "../hooks/useUser";
// import { useFormik } from "formik";
// import { object, string } from "yup";

// import styles from "./ForgetPassword.module.css";

// const schema = object().shape({
//   email: string()
//     .required("Email is required")
//     .matches(
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//       "Email is not valid"
//     ),
// });

// export default function ForgotPassword() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [timer, setTimer] = useState(0);
//   const [disableButton, setDisableButton] = useState(false);

//   const { users } = useUser();
//   const navigate = useNavigate();

//   // ✅ عند تحميل الصفحة، نحسب الوقت المتبقي بناءً على `endTime` المخزن في `localStorage`
//   useEffect(() => {
//     const endTime = localStorage.getItem("resetEndTime");
//     if (endTime) {
//       const remainingTime = Math.floor((parseInt(endTime) - Date.now()) / 1000);
//       if (remainingTime > 0) {
//         setTimer(remainingTime);
//         setDisableButton(true);
//       } else {
//         localStorage.removeItem("resetEndTime");
//         setDisableButton(false);
//       }
//     }
//   }, []);

//   // ✅ تحديث العداد وعرض الوقت المتبقي
//   useEffect(() => {
//     if (timer > 0) {
//       const countdown = setInterval(() => {
//         setTimer((prev) => {
//           if (prev <= 1) {
//             clearInterval(countdown);
//             setDisableButton(false);
//             localStorage.removeItem("resetEndTime");
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       return () => clearInterval(countdown);
//     }
//   }, [timer]);

//   const handleSubmit = async () => {
//     const user = users.find((user) => user.email === formik.values.email);

//     if (!user) {
//       toast.error("User not found.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);
//     setDisableButton(true);

//     const newEndTime = Date.now() + 60000; // ✅ حساب وقت انتهاء المؤقت بعد 60 ثانية
//     localStorage.setItem("resetEndTime", newEndTime);

//     setTimer(60); // ✅ تعيين العداد إلى 60 ثانية

//     try {
//       const res = await fetch("http://localhost:5000/forget", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: user.email, id: user.id }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.message || "Failed to send email.");
//       }

//       setSuccess("Password reset link sent. Please check your email.");
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//     },
//     validationSchema: schema,
//     onSubmit: handleSubmit,
//   });

//   return (
//     <div className="container my-5">
//       <div className="row justify-content-center">
//         <div className="col-lg-6 col-md-8 col-sm-10">
//           <div className="card">
//             <div className="card-body">
//               <h2 className="card-title text-center mb-4">Forgot Password</h2>
//               <form onSubmit={formik.handleSubmit}>
//                 <div className="form-group">
//                   <label>Email address </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter your email"
//                     name="email"
//                     value={formik.values.email}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                   />
//                   {formik.touched.email && formik.errors.email && (
//                     <div className="text-danger">{formik.errors.email}</div>
//                   )}
//                 </div>
//                 <div className="text-center mt-3">
//                   <button
//                     type="submit"
//                     className="btn btn-primary w-100"
//                     disabled={loading || disableButton}
//                   >
//                     {loading
//                       ? "Sending..."
//                       : disableButton
//                         ? `Please wait ${timer}s`
//                         : "Send Reset Link"}
//                   </button>
//                   {error && <div className="text-danger mt-2">{error}</div>}
//                   {success && (
//                     <div className="text-success mt-2">{success}</div>
//                   )}
//                 </div>
//               </form>
//               <div className="mt-3 text-center">
//                 <button
//                   className="btn btn-link"
//                   onClick={() => navigate("/login")}
//                 >
//                   Back to Login
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// _______________________________________________
// _______________________________________________
// _______________________________________________

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { object, string } from "yup";
import styles from "./ForgetPassword.module.css";

const baseUrl = "https://greencityapi.runasp.net";

const schema = object().shape({
  email: string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    ),
});

export default function ForgotPasswordModal({ closeModal }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [timer, setTimer] = useState(0);
  const [disableButton, setDisableButton] = useState(
    localStorage.getItem("resetEndTime") ? true : false
  );
  const [adminToken, setAdminToken] = useState(null);

  // Admin login to get JWT token
  useEffect(() => {
    const adminLogin = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/Auth/Login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            EmailAddress: "Admin123@example.com",
            Password: "Admin@12345",
            deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" }
          }),
        });

        if (!response.ok) {
          throw new Error(`Admin auth failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setAdminToken(data.jwtToken);
      } catch (error) {
        toast.error("Admin authentication error: " + error.message);
      }
    };

    adminLogin();
  }, []);

  // Calculate remaining time when modal loads
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

  // Update countdown every second
  useEffect(() => {
    if (timer > 0) {
      setDisableButton(true);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setDisableButton(false);
            localStorage.removeItem("resetEndTime");
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(countdown);
    } else {
      setDisableButton(false);
    }
  }, [timer]);

  const handleSubmit = async () => {
    if (!adminToken) {
      toast.error("Admin authentication is still in progress. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // First, fetch all users using admin token
    let user = null;
    
    try {
      const response = await fetch(`${baseUrl}/api/Users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const users = await response.json();
      user = users.find(u => u.email === formik.values.email);
      
      if (!user) {
        throw new Error("User not found.");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If user found, proceed to send reset email
    const newEndTime = Date.now() + 60000;
    localStorage.setItem("resetEndTime", newEndTime);
    setTimer(60);

    try {
      // CORRECTED ENDPOINT: Changed to /api/Account/ForgotPassword
      const res = await fetch(`${baseUrl}/api/Account/ForgotPassword`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ 
          email: user.email,
          identityUserId: user.identityUserId
        }),
      });

      // Handle empty response
      if (res.status === 204) {
        setSuccess("Password reset link sent. Please check your email.");
        toast.success("Password reset email sent successfully!");
      } else if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        
        try {
          const errorData = await res.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          console.error("Error parsing response", e);
        }
        
        throw new Error(errorMessage);
      } else {
        const data = await res.json();
        setSuccess(data.message || "Password reset link sent. Please check your email.");
        toast.success(data.message || "Password reset email sent successfully!");
      }
    } catch (error) {
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>🔒 Forgot Password</h3>
        <p className={styles.description}>Enter your email to receive a password reset link</p>
        
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email address:</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.email && formik.errors.email ? styles.inputError : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorText}>{formik.errors.email}</div>
            )}
          </div>

          <div className={styles.modalButtons}>
            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton} ${disableButton ? styles.disabledButton : ''}`}
              disabled={loading || disableButton || !adminToken}
            >
              {loading ? (
                <span className={styles.loadingIndicator}></span>
              ) : null}
              {loading
                ? "Sending..."
                : disableButton
                ? `Wait ${timer}s`
                : "Send Reset Link"}
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          {!adminToken && (
            <div className={styles.infoMessage}>
              Authenticating admin credentials...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

ForgotPasswordModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};