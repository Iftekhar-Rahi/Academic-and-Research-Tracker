// run this file by hand (npm run scrape) whenever you want to (re)fill the faculty data.
// the running app never calls this itself - it only ever reads what's already in the database

require("dotenv").config(); // load MONGO_URI from .env file

const mongoose = require("mongoose");
const { scrapeAll } = require("./scraper");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  const summary = await scrapeAll();
  console.log("Scrape complete:", summary);
  await mongoose.connection.close();
  process.exit(0);
})();
