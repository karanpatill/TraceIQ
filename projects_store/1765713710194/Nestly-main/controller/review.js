const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.postReview = async (req, res) => {
    const list = await Listing.findById(req.params.id);
    const { rating, comment } = req.body;
    const newReview = new Review({ rating, comment });
    newReview.author = req.user._id; 
    list.reviews.push(newReview);
    await newReview.save();
    req.flash('success', 'Review added successfully!');
    await list.save();
  
    res.redirect(`/listings/${list.id}`);
  }

  module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
  }
