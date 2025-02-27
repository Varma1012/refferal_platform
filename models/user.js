
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // Additional fields for password reset functionality:
  passwordResetToken: { type: String },
  passwordResetTokenExpiry: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
