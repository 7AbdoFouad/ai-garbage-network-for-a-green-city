
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
