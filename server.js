// import express from "express";
// import nodemailer from "nodemailer";
// import cors from "cors";


// const app = express();

// // ✅ Apply CORS middleware properly
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// app.use(express.json());

// // Define your router after applying CORS
// const router = express.Router();
// app.use("/", router);

// app.listen(5000, () => {
//   console.log("Server is running on port 5000");
// });

// // Nodemailer setup
// const forgetpasswordEmail = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "your-email@gmail.com,
//     pass: "your-email-password",
//   },
// });

// forgetpasswordEmail.verify((error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Ready to Send Email");
//   }
// });

// // ✅ Fix CORS Issue in your `/forget` Route
// router.post("/forget", async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Explicitly allow frontend origin
//   res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   const { email } = req.body;
//   const mail = {
//     from: "your-email@gmail.com",
//     to: email,
//     subject: "Reset Password",
//     html: `<h1>Reset Your Password</h1>
//       <p>Click this <a href="http://localhost:3000/reset-password">link</a> to reset your password.</p>`,
//   };

//   forgetpasswordEmail.sendMail(mail, (error) => {
//     if (error) {
//       res.status(500).json({ status: "Error", message: error.message });
//     } else {
//       res.status(200).json({ status: "Mail Sent", message: "Reset email sent successfully" });
//     }
//   });
// });
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";


// ✅ تحميل المتغيرات البيئية من `.env`
dotenv.config();

const app = express();

// ✅ تفعيل CORS للسماح بطلبات من الـ Frontend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ إنشاء Router
const router = express.Router();
app.use("/", router);

// ✅ تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// --------------------------------
// 🔹 إعداد Nodemailer (Gmail)
// --------------------------------
const forgetpasswordEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // يجب تعريف هذه القيم في `.env`
    pass: process.env.GMAIL_PASS,
  },
});

// ✅ التحقق من جاهزية Nodemailer
forgetpasswordEmail.verify((error) => {
  if (error) {
    console.error("❌ Nodemailer Error:", error);
  } else {
    console.log("✅ Nodemailer is Ready to Send Emails");
  }
});

// --------------------------------
// 🔹 إعداد Resend
// --------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Route لإرسال الإيميل باستخدام `Nodemailer` أو `Resend`
router.post("/forget", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email, method } = req.body; // method = "nodemailer" أو "resend"

  // ✅ التحقق من المدخلات
  if (!email || !method) {
    return res.status(400).json({ error: "Email and method are required" });
  }

  try {
    if (method === "nodemailer") {
      // 📩 إرسال الإيميل عبر Nodemailer
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Reset Password",
        html: `
          <h1>🔐 Reset Your Password</h1>
          <p>Click this <a href="http://localhost:3000/reset-password">link</a> to reset your password.</p>
        `,
      };

      await forgetpasswordEmail.sendMail(mailOptions);
      return res.status(200).json({ message: "📧 Email sent via Nodemailer" });

    } else if (method === "resend") {
      // 📩 إرسال الإيميل عبر Resend
      await resend.emails.send({
        from: "Abdulrahman <onboarding@resend.dev>",
        to: email,
        subject: "Reset Password",
        html: `
          <h1>🔐 Reset Your Password</h1>
          <p>Click this <a href="http://localhost:3000/reset-password">link</a> to reset your password.</p>
        `,
      });

      return res.status(200).json({ message: "📧 Email sent via Resend" });

    } else {
      return res.status(400).json({ error: "Invalid email method. Use 'nodemailer' or 'resend'." });
    }

  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
