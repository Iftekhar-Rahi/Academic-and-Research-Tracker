// The single entry point of the app: this is what `npm start` and `npm run dev` run.
//
// MVC flow, for anything under /api:
//
//   request -> routes/ -> middleware/ -> controllers/ -> services/ -> models/ -> MongoDB
//                                             |
//                                             +-> JSON response -> the React app in frontend/

require("dotenv").config(); // load values from .env file

// Node's DNS resolver on this machine reports 127.0.0.1 as its server (leftover from a
// Hyper-V virtual adapter), which nothing listens on, so mongodb+srv:// SRV lookups fail
// with ECONNREFUSED. Point it at real DNS servers so the Atlas hostname can resolve.
require("dns").setServers(["1.1.1.1", "8.8.8.8"]);

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const apiRoutes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// connect to the MongoDB database
connectDB();

app.use(cors()); // allow the React app to call this server
app.use(express.json()); // let express read JSON data sent in requests

// anything dropped in public/ is served as-is, e.g. /css/site.css for public/css/site.css.
// the React app in frontend/ serves its own assets in dev, so this is for files the API
// itself needs to hand out.
app.use(express.static(path.join(__dirname, "public")));

// just to check the server is working if you open it in the browser
app.get("/", (req, res) => {
  res.send("API is running");
});

// every /api/... URL is listed in routes/index.js
app.use("/api", apiRoutes);

// these two must come last: anything that didn't match a route, and anything that threw
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
