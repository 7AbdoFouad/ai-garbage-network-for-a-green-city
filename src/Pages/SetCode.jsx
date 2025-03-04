import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function SetCode() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const emailOrPhone = location.state?.emailOrPhone || "";
  const correctCode = "1234"; // Simulated correct code

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code === correctCode) {
      toast.success("Code verified successfully.");
      navigate("/reset-password", { state: { emailOrPhone } });
    } else {
      toast.error("Invalid code. Please try again.");
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Enter Verification Code</h2>
              <p className="text-center">A verification code has been sent to {emailOrPhone}.</p>
              <form onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    className="form-control text-center"
                    placeholder="Enter 4-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={4}
                  />
                </div>
                <div className="text-center mt-3">
                  <button type="submit" className="btn btn-primary w-100">
                    Verify Code
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <button className="btn btn-link" onClick={() => navigate("/forgot-password")}>Resend Code</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
