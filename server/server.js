require("dotenv").config(); // load values from .env file

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const facultyRoutes = require("./features/thesis-supervisors/routes");
const thesisGroupRoutes = require("./features/thesis-groups/routes");
const courseResourceRoutes = require("./features/course-resources/routes");
const requireAuth = require("./middleware/auth");

const app = express();

// connect to the MongoDB database
connectDB();

app.use(cors()); // allow the frontend to call this server
app.use(express.json()); // let express read JSON data sent in requests

// any request to /api/auth/... goes to our auth routes file
app.use("/api/auth", authRoutes);

// thesis supervisor directory, scraped ahead of time by npm run scrape (see features/thesis-supervisors/scrape.js)
app.use("/api/faculty", requireAuth, facultyRoutes);

// thesis group finder board - students posting to find groupmates or a group to join
app.use("/api/thesis-groups", requireAuth, thesisGroupRoutes);
// course resources board - students sharing links to slides, notes, question banks, etc.
app.use("/api/course-resources", requireAuth, courseResourceRoutes);
app.use("/api/study-planner", require("./features/study-planner/routes"));

// just to check the server is working if you open it in the browser
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
