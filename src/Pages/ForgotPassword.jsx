import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate sending reset link
    if (!emailOrPhone) {
      toast.error("Please enter your email or phone number.");
      return;
    }
    
    toast.success("Password reset link sent to your email or phone.");
    navigate("/reset-password");
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
                  <button type="submit" className="btn btn-primary w-100" >
                    Send Reset Link
                  </button>
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
