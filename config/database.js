const mongoose = require("mongoose");

// connect to MongoDB using the connection string from .env
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // pulls out just the cluster id (e.g. "aoop7pg") from the host, so it's easy to eyeball
    // which Atlas cluster we're on without reading the whole hostname
    const clusterId = mongoose.connection.host.match(/\.([a-z0-9]+)\.mongodb\.net$/i)?.[1] || mongoose.connection.host;
    console.log(`MongoDB connected to database "${mongoose.connection.name}" on cluster ${clusterId}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
