const express = require('express');
const listing = require('../models/listing.js');
const Review = require('../models/review.js');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, validateReview , isAuthor} = require('../middleware.js');
const {postReview , deleteReview} = require('../controller/review.js');
//review routes
router.post("/:id/review", isLoggedIn ,validateReview, wrapAsync(postReview));

  router.delete("/:id/review/:reviewId",isAuthor, isLoggedIn, wrapAsync(deleteReview));

  module.exports = router;