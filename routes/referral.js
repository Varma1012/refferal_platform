const express = require('express');
const User = require('../models/User');

const router = express.Router();


// GET /api/auth/referrals - Fetch referrals for a user
router.get('/', async (req, res) => {
  const {userId }= req.query;

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      // Fetch referrals and include only relevant fields (username)

      const referrals = await User.find({ referredBy: user._id }, 'username');
      res.json({ referrals, referralCount: referrals.length });
     } catch (err) {
      console.error("Error fetching referrals:", err);
      res.status(500).json({ message: 'Server error' });
  }
});



// GET /api/auth/stats - Get referral stats for a user
router.get('/stats', async (req, res) => {
    const { userId } = req.query;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const referralStats = await User.aggregate([
            { $match: { referredBy: user._id } },
            { $group: { _id: '$referredBy', referralCount: { $sum: 1 } } }
        ]);

        res.json({ referralStats });
    } catch (err) {
        console.error("Error fetching referral stats:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
