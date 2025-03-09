import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyEmail() {
      try {
        const response = await fetch(`http://localhost:5000/verify-email/${token}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);
        toast.success("Email verified successfully! You can now register.");
        navigate("/register");
      } catch (e) {
        toast.error("Email verification failed.");
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token, navigate]);

  return loading ? <p>Verifying email...</p> : <p>Email verified successfully!</p>;
}
