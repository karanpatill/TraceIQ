const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner ,validateListing} = require('../middleware.js');
const {index ,newListingForm  , createListing ,showListing ,editListingForm , updateListing, deleteListing , searchListing} = require('../controller/listings.js');
const multer = require('multer');
const { storage } = require('../CloudStorage.js'); // ✅ lowercase
const upload = multer({ storage }); // ✅ pass it as 'storage' key, not 'Storage'


router.route("/")
.get(wrapAsync(index))
.post(upload.single('image'),validateListing , wrapAsync(createListing) );


router.get("/new", isLoggedIn , newListingForm  );



router.route("/:id")
.get(wrapAsync(showListing))
.put(upload.single('image'),isLoggedIn, isOwner, wrapAsync(updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(deleteListing));

router.get("/:id/edit", isLoggedIn , isOwner,wrapAsync(editListingForm));



module.exports = router;
