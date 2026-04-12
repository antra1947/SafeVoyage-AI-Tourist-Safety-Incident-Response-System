const jwt = require("jsonwebtoken");
const User = require("./authModel");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  const { firstName, lastName, email, password, age, gender } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered" });

    const user = await User.create({ firstName, lastName, email, password, age, gender });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login };
