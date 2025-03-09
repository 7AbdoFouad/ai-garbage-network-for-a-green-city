import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUser from "../hooks/useUser";

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [disableButton, setDisableButton] = useState(false);
  const [timer, setTimer] = useState(0);
  const { users } = useUser();
  const navigate = useNavigate();

  const searchUsers = (emailOrPhone) => {
    return users.find((user) => user.email === emailOrPhone || user.phone === emailOrPhone);
  };

  const findEmail = (emailOrPhone) => {
    const user = searchUsers(emailOrPhone);
    return user ? user.email : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone) {
      toast.error("Please enter your email or phone number.");
      return;
    }

    const user = searchUsers(emailOrPhone);
    if (!user) {
      toast.error("User not found.");
      return;
    }

    const email = findEmail(emailOrPhone);
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDisableButton(true);
    setTimer(60); // Start 60-second cooldown

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          setDisableButton(false);
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch("http://localhost:5000/forget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email.");
      }

      setSuccess("Password reset link sent. Please check your email.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
                  <button type="submit" className="btn btn-primary w-100" disabled={loading || disableButton}>
                    {loading ? "Sending..." : disableButton ? `Please wait ${timer}s` : "Send Reset Link"}
                  </button>
                  {disableButton }
                  {error && <div className="text-danger mt-2">{error}</div>}
                  {success && <div className="text-success mt-2">{success}</div>}
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
