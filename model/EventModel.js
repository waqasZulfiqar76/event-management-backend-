const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date, 
      default: new Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Conference', 'Workshop', 'Meetup', 'Seminar', 'Webinar'],
    },
    location: {
      type: String,
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },
    ],
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Event', eventSchema);
