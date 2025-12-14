
const User = require('../models/user');
module.exports.renderSignup = (req , res) => {
    res.render("listings/signup.ejs");
}

module.exports.signupUser =  async (req, res, next) => {
      try {
        let { email, username, password } = req.body;
        let newUser = new User({ email, username });
  
        let registeredUser = await User.register(newUser, password);
  
        req.login(registeredUser, (err) => {
          if (err) {
            return next(err);
          }
          req.flash("success", `Welcome ${username} to Wanderlust!`);
          return res.redirect("/listings");
        });
      } catch (e) {
        console.log(e);
        req.flash("error", "User already exists!");
        return res.redirect("/signup");
      }
    }

    module.exports.renderLogin = (req , res) => {
        res.render("listings/login.ejs");
    }

    module.exports.loginUser =  async (req , res) => {
        req.flash('success', `Welcome back ${req.user.username}!`);
        res.redirect(res.locals.redirecturl || '/listings');
}

    module.exports.logoutUser =  (req , res , next) => {

        req.logout((err) => {
            if (err) { return next(err); }
            req.flash('success', 'Goodbye! Come back soon!');
            res.redirect('/listings');
        })
        
    }