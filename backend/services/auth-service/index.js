require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("./model");

const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Auth Service: MongoDB connected"))
  .catch((e) => { console.error(e.message); process.exit(1); });

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName:  Joi.string().min(1).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  age:       Joi.number().optional(),
  gender:    Joi.string().valid("male", "female", "other").optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /register
app.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

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
});

// POST /login
app.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

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
});

// Internal: verify token (used by gateway)
app.get("/verify", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch { res.status(401).json({ success: false, message: "Invalid token" }); }
});

app.listen(process.env.PORT, () => console.log(`Auth Service running on port ${process.env.PORT}`));
