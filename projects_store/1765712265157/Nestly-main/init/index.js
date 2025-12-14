const mongoose = require("mongoose");
const Listing = require("../models/listing"); // adjust the path as needed
const { data: sampleListings } = require("../init/data"); // import the sample data

// Replace with your actual MongoDB Atlas connection string
const MONGO_URI ="mongodb://karanpatil001:karanKP96966@ac-cofefqt-shard-00-00.ddnx6wj.mongodb.net:27017,ac-cofefqt-shard-00-01.ddnx6wj.mongodb.net:27017,ac-cofefqt-shard-00-02.ddnx6wj.mongodb.net:27017/?replicaSet=atlas-kue39t-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0"; // Update this with your Atlas URI

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected to Atlas");
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });

const seedDB = async () => {
    await Listing.deleteMany({});
    console.log("Old listings removed");

//     await Listing.insertMany(sampleListings);
//     console.log("Database seeded with new listings");
//   } catch (err) {
//     console.error("Seeding error:", err);
//   } finally {
//     mongoose.connection.close();
//   }
};

seedDB();
