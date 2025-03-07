import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();

// ✅ Apply CORS middleware properly
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());

// Define your router after applying CORS
const router = express.Router();
app.use("/", router);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// Nodemailer setup
const forgetpasswordEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bdalrhmnfwad15@gmail.com",
    pass: "lxtt rzyx pytr doqc",
  },
});

forgetpasswordEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send Email");
  }
});

// ✅ Fix CORS Issue in your `/forget` Route
router.post("/forget", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Explicitly allow frontend origin
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.body;
  const mail = {
    from: "bdalrhmnfwad15@gmail.com",
    to: email,
    subject: "Reset Password",
    html: `<h1>Reset Your Password</h1>
      <p>Click this <a href="http://localhost:3000/reset-password">link</a> to reset your password.</p>`,
  };

  forgetpasswordEmail.sendMail(mail, (error) => {
    if (error) {
      res.status(500).json({ status: "Error", message: error.message });
    } else {
      res.status(200).json({ status: "Mail Sent", message: "Reset email sent successfully" });
    }
  });
});
