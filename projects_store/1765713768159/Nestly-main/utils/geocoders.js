const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: process.env.MAP_API, // Load from .env
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
