
// import { NextResponse } from "next/server";
// import { Resend } from "resend"; // Adjust the import path as necessary
// import Welcome from "../../email/Welcome";

// export async function POST(req: Request) {
//     try {
//       const { email } = await req.json();
//       if (!email) {
//         return NextResponse.json({ error: "Email is required" }, { status: 400 });
//       }
  
//       const resend = new Resend(process.env.RESEND_API_KEY);
  
//       await resend.emails.send({
//         from: "Abdulrahman <onboarding@resend.dev>",
//         to: email,
//         subject: "Welcome",
//         react: Welcome(),
//       });
  
//       return NextResponse.json({ message: "Email sent successfully" });
//     } catch (error) {      
//       const errorMessage = error instanceof Error ? error.message : "Internal server error";
//       return NextResponse.json({ error: errorMessage }, { status: 500 });
//     }
//   }
  
  

import express from "express";
// import nodemailer from "nodemailer";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
// import Welcome from "../../email/Welcome";
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
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/forget", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email,id} = req.body; // method = "nodemailer" أو "resend"


  try {
      // 📩 إرسال الإيميل عبر Resend
      await resend.emails.send({
        from: "Abdulrahman <onboarding@resend.dev>",
        to: email,
        subject: "Reset Password",
        html:`
          <h1>🔐 Reset Your Password</h1>
          <p>Click this <a href="http://localhost:5173/reset-password/${id}">link</a> to reset your password.</p>
        `,
      });
      return res.status(200).json({ message: "📧 Email sent via Resend" });
    }
   catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/delUser", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.body; // method = "nodemailer" او "resend"

  try {
    // 📩 ارسال الايميل عبر Resend
    await resend.emails.send({
      from: "Abdulrahman <onboarding@resend.dev>",
      to: email,
      subject: "Delete Account",
      html:`
        Your account has been deleted From Clean City Management.
      `,
    });
    return res.status(200).json({ message: "📧 Email sent via Resend" });
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
router.post("/delMang", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.body; // method = "nodemailer" او "resend"

  try {
    // 📩 ارسال الايميل عبر Resend
    await resend.emails.send({
      from: "Abdulrahman <onboarding@resend.dev>",
      to: email,
      subject: "Delete Account",
      html:`
        Your account has been deleted From Clean City Management.
      `,
    });
    return res.status(200).json({ message: "📧 Email sent via Resend" });
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
router.post("/delTruck", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email } = req.body; // method = "nodemailer" او "resend"

  try {
    // 📩 ارسال الايميل عبر Resend
    await resend.emails.send({
      from: "Abdulrahman <onboarding@resend.dev>",
      to: email,
      subject: "Delete Account",
      html:`
        Your account has been deleted From Clean City Management.
      `,
    });
    return res.status(200).json({ message: "📧 Email sent via Resend" });
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/edMang", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email,data } = req.body; // method = "nodemailer" او "resend"
  const {name,phone,Address,password,Permissions} = data;

  try {
    // 📩 ارسال الايميل عبر Resend
    await resend.emails.send({
      from: "Abdulrahman <onboarding@resend.dev>",
      to: email,
      subject: "Edit Account",
      html:`
        Your account has been Edited From Clean City Management.
        Here is the new data:
        ${
          `
          <div>Name: ${name}</div>
          <div>Email: ${email}</div>
          <div>Phone: ${phone}</div>
          <div>Address: ${Address}</div>
          <div>Password: ${password}</div>
          <div>Permissions: ${Permissions}</div>
          `
        }
      `,
    });
    return res.status(200).json({ message: "📧 Email sent via Resend" });
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});
router.post("/edTruck", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { email,data } = req.body; // method = "nodemailer" او "resend"
  const {name,phone,Address,password,truckNumber} = data;
  try {
    // 📩 ارسال الايميل عبر Resend
    await resend.emails.send({
      from: "Abdulrahman <onboarding@resend.dev>",
      to: email,
      subject: "Edit Account",
      html:`
        Your account has been Edited From Clean City Management.
        Here is the new data:
        ${
          `
          <div>Name: ${name}</div>
          <div>Email: ${email}</div>
          <div>Phone: ${phone}</div>
          <div>Address: ${Address}</div>
          <div>Password: ${password}</div>
          <div>truckNumber: ${truckNumber}</div>
          `
        }
      `,
    });
    return res.status(200).json({ message: "📧 Email sent via Resend" });
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// __________________________________________________________________________
// import express from "express";
// import cors from "cors";
// import { Resend } from "resend";
// import dotenv from "dotenv";
// import crypto from "crypto";

// dotenv.config();

// const app = express();
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json());

// const router = express.Router();
// app.use("/", router);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server is running on port ${PORT}`);
// });

// const resend = new Resend(process.env.RESEND_API_KEY);

// // Temporary storage (Use a database in production)
// const users = {};

// router.post("/register", async (req, res) => {
//   const { email, name } = req.body;

//   // Generate a random verification token
//   const token = crypto.randomBytes(32).toString("hex");
//   users[email] = { name, verified: false, token };

//   try {
//     await resend.emails.send({
//       from: "HealthLink <onboarding@resend.dev>",
//       to: email,
//       subject: "Verify Your Email",
//       html: `
//         <h1>Welcome, ${name}!</h1>
//         <p>Please verify your email by clicking the link below:</p>
//         <a href="http://localhost:5173/verify-email/${token}">Verify Email</a>
//       `,
//     });
//     res.status(200).json({ message: "Verification email sent!" });
//   } catch (error) {
//     console.error("❌ Email Sending Error:", error);
//     res.status(500).json({ error: "Failed to send verification email" });
//   }
// });

// router.get("/verify-email/:token", (req, res) => {
//   const { token } = req.params;

//   const user = Object.keys(users).find(
//     (email) => users[email].token === token
//   );

//   if (!user) {
//     return res.status(400).json({ error: "Invalid or expired token" });
//   }

//   users[user].verified = true;
//   res.status(200).json({ message: "Email verified successfully!" });
// });
