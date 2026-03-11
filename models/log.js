const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    level: { type: String },
    message: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    hostname: { type: String },
  },
  { collection: 'logs', timestamps: false }
);

module.exports = mongoose.model('Log', logSchema);