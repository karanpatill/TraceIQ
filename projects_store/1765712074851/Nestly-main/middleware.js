const listings = require('./models/listing');
const Review = require('./models/review.js');
const express = require('express');
const listing = require('./models/listing.js');
const router = express.Router();
const wrapAsync = require('./utils/wrapAsync.js');
const { listingSchema, reviewSchema } = require('./Schema.js');
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl; // Store the original URL
        req.flash('error', 'You must be logged in to create a listing!');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveurl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.redirecturl = req.session.returnTo; // Store the original URL in res.locals
    }
    next(); 
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const list = await listing.findById(id);
    if(!list.owner._id.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission to perform this task !');
        return res.redirect(`/listings/${list._id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => { 
    let { error } = listingSchema.validate(req.body); 
    if (error) { 
        let errMsg = error.details.map(el => el.message).join(','); 
        throw new ExpressError(400, errMsg);
    } 
    next(); 
};

module.exports.validateReview = (req, res, next) => { 
    let { error } = reviewSchema.validate(req.body); 
    if (error) { 
        let errMsg = error.details.map(el => el.message).join(','); 
        throw new ExpressError(400, errMsg); 
    } 
    next(); 
};

module.exports.isAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission to perform this task !');
        return res.redirect(`/listings/${id}`);
    }
    next();
}