
import { NextResponse } from "next/server";
import { Resend } from "resend"; // Adjust the import path as necessary
import Welcome from "../../email/Welcome";

export async function POST(req: Request) {
    try {
      const { email } = await req.json();
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
  
      const resend = new Resend(process.env.RESEND_API_KEY);
  
      await resend.emails.send({
        from: "Abdulrahman <onboarding@resend.dev>",
        to: email,
        subject: "Welcome",
        react: Welcome(),
      });
  
      return NextResponse.json({ message: "Email sent successfully" });
    } catch (error) {      
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
  
  