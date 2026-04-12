const nodemailer = require("nodemailer");

// Provider-agnostic email transporter
const createTransporter = () => {
  if (process.env.EMAIL_PROVIDER === "ses") {
    return nodemailer.createTransport({
      host: process.env.SES_HOST,
      port: parseInt(process.env.SES_PORT) || 587,
      secure: false,
      auth: { user: process.env.SES_USER, pass: process.env.SES_PASS },
    });
  }
  // Default: Gmail
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_USER || process.env.SES_USER;
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};

module.exports = { sendEmail };
