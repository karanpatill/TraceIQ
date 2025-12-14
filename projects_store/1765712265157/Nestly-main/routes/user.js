const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveurl } = require('../middleware.js');
const {renderSignup ,signupUser , renderLogin, loginUser, logoutUser} = require('../controller/user.js');

router.route("/signup")
  .get(renderSignup)
  .post(wrapAsync(signupUser));

router.route("/login")
  .get(renderLogin)
  .post(
    saveurl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    loginUser
  );



router.get("/logout" ,logoutUser);

module.exports = router;