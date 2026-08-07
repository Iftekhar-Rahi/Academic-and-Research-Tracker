const mongoose = require("mongoose");

// one document = one post on the Thesis Group Finder board - either an existing group
// looking for more members ("group") or a student looking to join one ("individual")
const thesisGroupPostSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["group", "individual"],
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  researchAreas: {
    type: [String],
    default: [], // for a "group" post: the group's research areas. for an "individual" post: areas the student is interested in
  },
  description: {
    type: String,
    default: "",
  },

  // group-only fields, left unset on individual posts
  topic: {
    type: String,
    default: "",
  },
  proposedSupervisor: {
    type: String,
    default: "", // just a name typed in by the poster, not linked to the Faculty collection
  },
  currentMembers: {
    type: Number,
  },
  membersNeeded: {
    type: Number,
  },
  skillsNeeded: {
    type: String,
    default: "",
  },

  // individual-only field, left unset on group posts
  skills: {
    type: String,
    default: "",
  },
}, { timestamps: true });

thesisGroupPostSchema.index({ researchAreas: 1 });

module.exports = mongoose.model("ThesisGroupPost", thesisGroupPostSchema);
