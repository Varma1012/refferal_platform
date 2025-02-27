
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');

const router = express.Router();

// Helper function to generate referral code
function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// User Registration Route
router.post('/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('username').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password, referralCode } = req.body;

  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the referrer if referral code is provided
    const referrer = referralCode ? await User.findOne({ referralCode }) : null;

    // Create a new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      referredBy: referrer ? referrer._id : null
    });

    // Save the user
    await newUser.save();

    // Update referrer's referral count if applicable
    if (referrer) {
      referrer.referralCount += 1;
      await referrer.save();
    }

    // Respond with success
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//login

router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY, 
      { expiresIn: '24h' }
    );


    res.json({ token
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//pasword reset system
const nodemailer = require('nodemailer');

// POST /api/forgot-password
router.post('/forget-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate reset token and save to user
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiry = Date.now() + 30 * 60 * 1000; // Token expires in 30 minutes
    await user.save();

    // Send reset email
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Direct password
      },
    });
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click here to reset your password: http://127.0.0.1:3001/reset-password.html?token=${resetToken}`

    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
 
//refferal tracking


const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token
  console.log("Received Token:", token);
  
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.userId = decoded.userId;
      console.log("Decoded User ID:", req.userId);
      next();
  } catch (err) {
      console.error("Invalid Token:", err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// GET /api/auth/user-details (Protected Route)
router.get('/user-details', authenticate, async (req, res) => {
  try {
      const user = await User.findById(req.userId);
      
      if (!user) {
          console.log("User not found in DB");
          return res.status(404).json({ message: 'User not found' });
      }

      console.log("User Details Fetched:", { username: user.username, referralCode: user.referralCode });
      res.json({
          username: user.username,
          referralCode: user.referralCode,
          referedBy:user.referedBY,
          userId: user._id
      });

  } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;