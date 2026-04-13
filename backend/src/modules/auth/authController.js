const jwt  = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("./authModel");
const { sendEmail } = require("../../utils/emailService");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  const { firstName, lastName, email, password, age, gender } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered" });
    const user = await User.create({ firstName, lastName, email, password, age, gender });
    res.status(201).json({
      success: true, message: "User registered successfully",
      data: {
        user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    res.json({
      success: true, message: "Login successful",
      data: {
        user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: "No account with that email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken   = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "SafeVoyage AI — Password Reset Request",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color:#c0392b;">Password Reset</h2>
          <p>Hi <strong>${user.firstName}</strong>,</p>
          <p>You requested a password reset. Click the button below. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#c0392b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">Reset Password</a>
          <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email. Your password won't change.</p>
        </div>`,
      text: `Reset your password: ${resetUrl}`,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: "Token is invalid or has expired" });

    user.password             = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { register, login, forgotPassword, resetPassword };
