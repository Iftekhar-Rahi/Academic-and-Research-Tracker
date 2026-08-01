const mongoose = require("mongoose");

// this describes what fields a user has in the database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // no two users can have the same email
    lowercase: true, // always save email in lowercase
  },
  password: {
    type: String,
    required: true, // this is the hashed password, not the real one
  },
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("User", userSchema);
