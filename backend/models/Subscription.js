const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    tradingTips: {
      type: Boolean,
      default: true
    },
    courseUpdates: {
      type: Boolean,
      default: true
    },
    marketNews: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
