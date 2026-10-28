const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("EMAIL_USER and EMAIL_PASS must be configured to send OTP emails.");
}

const SendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for booking with us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email", error);
  }
};

const sendOTPEmail = async (email, otp, type) => {
  try {
    let title = "Event Booking";
    let msg = "Please use the following OTP to confirm your event booking.";

    if (type === "account_verification") {
      title = "Account Verification";
      msg = "Please use the following OTP to verify your new Event account.";
    } else if (type === "password_reset") {
      title = "Password Reset";
      msg = "Please use the following OTP to reset your account password.";
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #111;">${title}</h2>
          <p style="font-size: 16px; color: #555;">${msg}</p>
          <div style="font-size: 24px; margin: 20px auto; font-weight: bold; background: #f4f4f4; width: max-content; padding: 10px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #999;">This OTP will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for ${type}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("OTP email could not be sent. Check the server email configuration.");
  }
};

module.exports = { SendBookingEmail, sendOTPEmail };
