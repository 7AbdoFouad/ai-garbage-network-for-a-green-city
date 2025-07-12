import { useState, useEffect, useRef } from "react";
import { object, string } from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./Registeration.module.css";

const schema = object().shape({
  name: string()
    .required("Name is required")
    .matches(/^[a-zA-Z\s]+$/, "Invalid Name, must contain letters only"),
  email: string()
    .required("Email is required")
    .email("Invalid email address"),
  phone: string()
    .required("Phone is required")
    .matches(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number"),
  Address: string().required("Address is required"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Registration() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);
  const fbInitAttempted = useRef(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("Name", values.name);
      formData.append("Email", values.email);
      formData.append("Phone", values.phone);
      formData.append("Address", values.Address);
      formData.append("Password", values.password);

      const response = await fetch("/api/Auth/RegisterUser", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errors = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : data.message || data.title || "Registration failed";
        throw new Error(errors);
      }

      toast.success( "User registered successfully!");

      if (data.jwtToken) {
         login(data.jwtToken, values.email, values.password);
        setLoginAttempted(true);
      } else {
        toast.error("Login failed. No token received.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user && loginAttempted) {
      const role = user.role;
      if (role === "User") {
        navigate(`/userDashboard/`);
      } else if (role === "TruckDriver") {
        navigate(`/truckDriverDashboard/`);
      } else {
        navigate(`/managerDashboard/`);
      }
      setLoginAttempted(false);
    }
  }, [user, isLoading, loginAttempted, navigate]);
 const authenticateWithSocial = async (provider, token, socialData) => {
    try {
      // First try to log in with social credentials
            const email =  socialData.email;
      const password =`${provider}` ;
      
      const payload = {
        EmailAddress: email,
        Password: "11111111",
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };
      const loginPayload = {
        provider,
        token,
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      const loginResponse = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      if (loginResponse.ok) {     

        const loginData = await loginResponse.json();
        if (loginData.jwtToken) {
          login(loginData.jwtToken, socialData.email, null);
          setLoginAttempted(true);
          return;
        }
      }
      

      // If login fails, try to register automatically
      const fixedPassword = `${provider}`;
      const registrationData = {
        Name: socialData.name,
        Email: socialData.email,
        Phone: "01000000000", // Placeholder phone number
        Address: "Auto-registered via social login", // Placeholder address
        Password: fixedPassword,
      };

      const formData = new FormData();
      console.log(socialData);
      
      formData.append("Name", socialData.name);
      formData.append("Email", socialData.email);
      formData.append("Phone", "01234562121"); // Placeholder phone number
      formData.append("Address", "Auto-registered via social login"); // Placeholder address
      formData.append("Password", '11111111');

      // Object.entries(registrationData).forEach(([key, value]) => {
      //   formData.append(key, value);
      // });

      const registerResponse = await fetch("/api/Auth/RegisterUser", {
        method: "POST",
        body: formData,
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        const errorMsg = errorData.errors 
          ? Object.values(errorData.errors).flat().join('\n') 
          : errorData.message || "Automatic registration failed";
        throw new Error(errorMsg);
      }

      toast.success(`welcome ${socialData.name}! You have been registered successfully.`);

      // After registration, log in with the fixed password
      const loginAfterRegPayload = {
        EmailAddress: socialData.email,
        Password: "11111111",
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      const loginAfterRegResponse = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginAfterRegPayload),
      });

      if (!loginAfterRegResponse.ok) {
        throw new Error("Login after registration failed");
      }

      const loginAfterRegData = await loginAfterRegResponse.json();
      if (loginAfterRegData.jwtToken) {
        login(loginAfterRegData.jwtToken, socialData.email, fixedPassword);
        setLoginAttempted(true);
      } else {
        throw new Error("No token received after registration");
      }
    } catch (err) {
      console.error(err);
      toast.error(`Social login failed: ${err.message}`);
    }
  };


  useEffect(() => {
    if (fbInitAttempted.current) return;
    fbInitAttempted.current = true;

    if (window.FB) {
      setIsFbSdkReady(true);
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: "649672187611943",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v13.0"
      });
      setIsFbSdkReady(true);
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    
    script.onerror = () => {
      // console.error("Failed to load Facebook SDK");
      // toast.error("Failed to load Facebook login. Please try again later.");
    };
    
    document.body.appendChild(script);
  }, []);

  const handleGoogleLogin = (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google login failed: no token received");
      return;
    }
    
    const decoded = jwtDecode(idToken);
    const socialData = {
      name: decoded.name || "Google User",
      email: decoded.email || "",
    };
    
    authenticateWithSocial('google', idToken, socialData);
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      // toast.error("Facebook SDK not loaded. Please try again.");
      return;
    }

    window.FB.login(response => {
      if (response.status !== "connected") {
        // toast.error("Facebook login failed or was cancelled.");
        return;
      }
      
      // Get user profile data
      window.FB.api('/me', { fields: 'name,email' }, (profile) => {
        const socialData = {
          name: profile.name || "Facebook User",
          email: profile.email || `${profile.id}@facebook.com`,
        };
        
        authenticateWithSocial('facebook', response.authResponse.accessToken, socialData);
      });
    }, { scope: "public_profile,email" });
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      Address: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h3>Create Account</h3>
        </div>
        <div className={styles.authContent}>
          <form onSubmit={formik.handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className={`${styles.formControl} ${
                  formik.touched.name && formik.errors.name ? styles.isInvalid : ""
                }`}
                id="name"
                name="name"
                placeholder="John Doe"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <div className={styles.invalidFeedback}>{formik.errors.name}</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                className={`${styles.formControl} ${
                  formik.touched.email && formik.errors.email ? styles.isInvalid : ""
                }`}
                id="email"
                name="email"
                placeholder="user@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.invalidFeedback}>{formik.errors.email}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                className={`${styles.formControl} ${
                  formik.touched.phone && formik.errors.phone ? styles.isInvalid : ""
                }`}
                id="phone"
                name="phone"
                placeholder="01xxxxxxxxx"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className={styles.invalidFeedback}>{formik.errors.phone}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="Address">Address</label>
              <input
                type="text"
                className={`${styles.formControl} ${
                  formik.touched.Address && formik.errors.Address ? styles.isInvalid : ""
                }`}
                id="Address"
                name="Address"
                placeholder="Enter your address"
                value={formik.values.Address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.Address && formik.errors.Address && (
                <div className={styles.invalidFeedback}>{formik.errors.Address}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className={`${styles.formControl} ${
                  formik.touched.password && formik.errors.password ? styles.isInvalid : ""
                }`}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className={styles.invalidFeedback}>{formik.errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className={styles.socialDivider}>
            <span className={styles.dividerText}>Or continue with</span>
          </div>
          
      <div className={styles.socialAuth}>
             
                   
                                 <div className={styles.socialButtons}  
                                                           
                                  onFocus={(e) => {
                   e.target.style.outline = "none";
                   e.target.style.boxShadow = "none";
                   e.target.style.borderColor = "#dadce0";
                   e.target.style.borderWidth = "1px";
                 // e.target.style.backgroundColor = "#ffffff";
                 // blur the input field
                 e.target.blur();
                 }}
                 onBlur={(e) => {
                   e.target.style.outline = "none";
                   e.target.style.boxShadow = "none";
                     e.target.style.borderColor = "#dadce0";
                   e.target.style.borderWidth = "1px";
                   // e.target.style.backgroundColor = "#ffffff";
                 }}
     
     >
                                   <GoogleOAuthProvider clientId="346738253715-2niv19e5d3bdli28jsq05s6ictkk68ib.apps.googleusercontent.com"                                   
         
     >
                                     <GoogleLogin
                                       onSuccess={handleGoogleLogin}
                                       onError={() => toast.error("Google login failed")}
                                       
                                       render={({ onClick }) => (
                                         <button
                                           onClick={onClick}
                                           className={`${styles.socialButton} ${styles.googleButton}`}
       
                                         >
                                           <svg className={styles.socialIcon} viewBox="0 0 24 24">
                                             <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 00-.146-1.788l-9.854-.973z" fill="#EA4335"/>
                                             <path d="M5.576 8.456l2.855 2.102A5.997 5.997 0 0112.545 6c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2a9.996 9.996 0 00-8.97 5.5l1.001 1.956z" fill="#FBBC05"/>
                                             <path d="M12.545 22c2.583 0 4.93-.988 6.704-2.596l-3.095-2.619a5.955 5.955 0 01-3.609 1.209 5.997 5.997 0 01-5.642-3.94l-1.002 1.954a9.996 9.996 0 008.644 5.992z" fill="#34A853"/>
                                             <path d="M22.545 12c0-.814-.067-1.595-.195-2.346H12.545v4.639h5.642a5.53 5.53 0 01-2.399 3.646l3.095 2.619c1.83-1.732 2.962-4.296 2.962-7.558z" fill="#4285F4"/>
                                           </svg>
                                           Google
                                         </button>
                                       )}
     
                                     />
                                   </GoogleOAuthProvider>
               {/* Replace FacebookLogin with custom button */}
        <button
               onClick={handleFacebookLogin}
               className={`${styles.socialButton} ${styles.facebookButton}`}
               disabled={!isFbSdkReady}
             >
               <svg className={styles.socialIcon} viewBox="0 0 24 24">
                 <path 
                   d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                   fill="white"
                 />
               </svg>
               Facebook
             </button>
                                 </div>
                 </div>
          
          <p className={styles.loginLink}>
            Already have an account?{" "}
            <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}