const express = require('express');
 const { getReviews, replyToReview } = require('../controllers/reviewController');
 const router = express.Router();

 router.get('/',               getReviews);
 router.patch('/:id/reply',    replyToReview);
 module.exports = router;