const Joi = require('joi');

// Event validation schema
const validateEvent = (eventData) => {
  const schema = Joi.object({
    title: Joi.string().required().trim().min(3).max(100), 
    description: Joi.string().required().trim().min(10).max(500), 
    date: Joi.date().required(), 
    category: Joi.string().required().valid('Conference', 'Workshop', 'Meetup', 'Seminar', 'Webinar'), 
    location: Joi.string().required().trim().min(3).max(200), 
    organizer: Joi.array().items(Joi.string().hex().length(24)), 
    attendees: Joi.array().items(Joi.string().hex().length(24)),
  });

  return schema.validate(eventData);
};

module.exports = { validateEvent };
