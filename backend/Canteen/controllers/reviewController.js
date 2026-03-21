const mongoose = require('mongoose');

const TEMP_CANTEEN_ID = '69aac230df75a9778e441db5';

const getCollection = () => mongoose.connection.db.collection('feedbacks');

// ── GET /api/canteen/reviews ──────────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await getCollection()
      .find({ canteenId: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/canteen/reviews/:id/reply ──────────────────────────────────────
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty' });
    }

    const result = await getCollection().findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { reply: reply.trim(), repliedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Reply sent', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReviews, replyToReview };