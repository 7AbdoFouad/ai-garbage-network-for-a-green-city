import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // const handleSubmit = async(e) => {
  //   e.preventDefault();
    
  //   // Simulate sending reset link
  //   if (!emailOrPhone) {
  //     toast.error("Please enter your email or phone number.");
  //     return;
  //   }
  //   setLoading(true);
  //   setError(null);
  //   setSuccess(null);   
  //     try {
  //    const res= await fetch("../api/send-email",{
  //       method:"POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({email : "bdalrhmnfwad15@gmail.com"}),
  //     });
  //     const data=await res.json();
  //     console.log(data);
      
  //     if(!res.ok){
  //       const error=await res.json();
  //       throw new Error(error.message||"failed to send email");
  //     }
  //     setSuccess(data.message);
  //   } catch (error) {
  //     console.log(error);
      
  //     const errorMessage=error instanceof Error ? error.message : "Internal Server Error";
  //     setError(errorMessage);
  //   }finally{
  //     setLoading(false);
  //   }
  //   // toast.success("Password reset link sent to your email or phone.");
  //   // navigate("/reset-password");
  // };
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Simulate sending reset link
    if (!emailOrPhone) {
      toast.error("Please enter your email or phone number.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);   
      try {
     const res= await fetch("http://localhost:5000/forget",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email : "bdalrhmnfwad15@gmail.com"}),
      });
      const data=await res.json();
      console.log(data);
      
      if(!res.ok){
        const error=await res.json();
        throw new Error(error.message||"failed to send email");
      }
      setSuccess(data.message);
    } catch (error) {
      console.log(error);
      
      const errorMessage=error instanceof Error ? error.message : "Internal Server Error";
      setError(errorMessage);
    }finally{
      setLoading(false);
    }
    // toast.success("Password reset link sent to your email or phone.");
    // navigate("/reset-password");
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address or Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your email or phone number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="text-center mt-3">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading} >
                    {loading ? "Sending..." : "Send Reset Link"}
                    
                  </button>
                  {error && <div className="text-danger mt-2">{error}</div>}
                  {success && <div className="text-success mt-2">{success}</div>}
                </div>
              </form>
              <div className="mt-3 text-center">
                <button className="btn btn-link" >
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
