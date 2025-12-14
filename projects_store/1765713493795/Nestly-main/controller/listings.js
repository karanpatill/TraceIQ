 const Listing = require('../models/listing.js');
 const geocoder = require('../utils/geocoders.js'); // ✅ Ensure correct import
 
 module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render('listings/index.ejs', { listings });
}

module.exports.newListingForm = (req, res) => {
    res.render('listings/new.ejs');
}

 // make sure the path is correct

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body);

    // Save image
    if(req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    }
   

    // Set owner
    newListing.owner = req.user._id;

    // Geocode the address
    const geoData = await geocoder.geocode(`${req.body.location}, ${req.body.country}`);
    if (geoData && geoData.length > 0) {
        newListing.coordinates = {
            lat: geoData[0].latitude,
            lng: geoData[0].longitude
        };
    } else {
        // Optional: fallback in case geocoding fails
        console.warn("Geocoding failed, coordinates not set.");
    }

    await newListing.save();

    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
};


module.exports.showListing = async (req, res) => {
    ;
      const { id } = req.params;
      const list = await Listing.findById(id).populate({
        path: 'reviews',
        populate :{
          path : 'author',
        }
      }).populate('owner'); 
  
      if (!list) {
          req.flash('error', 'Listing not found!');
       return  res.redirect('/listings');
      }
      res.render('listings/show.ejs', { list });
    }

    module.exports.editListingForm = async (req, res) => {
      const { id } = req.params;
      const list = await Listing.findById(id);
  
      if (!list) {
          req.flash('error', 'Listing not found!');
          return res.redirect('/listings');
      }
  
      let image = list.image.url;
  
      res.render('listings/edit.ejs', { list, image });
  };
  

  module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const list = await Listing.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true
    });

    if (req.file !== undefined) {
        list.image = { url: req.file.path, filename: req.file.filename };
        await list.save();
    }

    req.flash('success', 'Listing updated successfully!');
    res.redirect('/listings');
};

    module.exports.deleteListing = async (req, res) => {
    
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash('success', 'Listing deleted successfully!');
        res.redirect('/listings');
    }
    
