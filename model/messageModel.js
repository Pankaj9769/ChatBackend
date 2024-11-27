const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  room: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const messageModel = mongoose.model("message", messageSchema);

module.exports = messageModel;
