const mongoose = require("mongoose");

// Version schema for document history
const VersionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: Object,
    required: true,
  },
});

//  Shared user schema
const SharedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor"],
    default: "viewer",
  },
});

// Document schema
const DocumentSchema = new mongoose.Schema(
  {
    _id: String, // manually set from UUID
    title: {
      type: String,
      default: "Untitled Document",
    },
    data: {
      type: Object, // Quill delta format
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    versions: [VersionSchema], //  Auto-saved snapshots every 60s

    // Shared with users (email + role)
    sharedWith: [SharedUserSchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("Document", DocumentSchema);
