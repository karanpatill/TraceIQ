const sampleListings = [
  // Existing listings...

  {
    title: "Snowy Cabin Escape in Norway",
    description:
      "Experience the northern lights from your own cozy cabin. Ideal for a winter wonderland retreat.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1606636660482-3e121b9f2c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 2800,
    location: "Tromsø",
    country: "Norway",
  },
  {
    title: "Zen Garden Retreat in Kyoto",
    description:
      "Find peace and tranquility in a traditional Japanese home surrounded by serene gardens.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1613541412339-d53968142f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 2300,
    location: "Kyoto",
    country: "Japan",
  },
  {
    title: "Cliffside Villa in Santorini",
    description:
      "Soak in sunset views over the Aegean Sea in this cliffside villa with a private infinity pool.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1576866209830-5f62e5883b26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 3200,
    location: "Santorini",
    country: "Greece",
  },
];

module.exports = { data: sampleListings };
