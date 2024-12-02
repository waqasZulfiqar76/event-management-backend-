const Event = require('../model/EventModel'); 
const UserModel = require('../model/UserModel');
const { paginate } = require('../utils/pagination.js');
const { validateEvent } = require('../Validators/EventValidators.js'); 

// Create Event
exports.createEvent = async (req, res) => {
    const { title, description, date, category, location, organizer  } = req.body;
    

    const { error } = validateEvent(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
      // Find the user 
      const user = await UserModel.findById(organizer);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
    try {
      // Create new event
      const newEvent = new Event({
        title,
        description,
        date,
        category,
        location,
      organizer
      });
  
      // Save event to the database
      const savedEvent = await newEvent.save();
  
    
  
      // Push the event ID to the user's eventsCreated (or similar field)
      user.eventsCreated.push(savedEvent._id); // Assuming the user has a field `eventsCreated`
      await user.save(); // Save the user document with the new event reference
  
      // Respond with the new event data
      res.status(201).json({
        message: 'Event created successfully.',
        event: savedEvent,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };

  // Get All Events
  exports.getAllEvents = async (req, res) => {
    try {
     
      const { page = 1, limit = 10, title, category, location } = req.query;
  
      
      const filter = {
        title,   
        category, 
        location, 
      };
  
    
      const { results, pagination } = await paginate(Event, page, limit, filter);
  
    
      res.json({
        message: 'Events fetched successfully',
        events: results,
        pagination: pagination,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };

  // get specific event 
exports.getEventById = async (req, res) => {
    try {
      const { eventId } = req.params; 
  
      // Find the event by its ID
      const event = await Event.findById(eventId).populate('attendees').populate('organizer','name email'); 
  
      // If the event is not found, return a 404 response
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Respond with the event data
      res.json({
        message: 'Event retrieved successfully',
        event,
      });
    } catch (err) {
      console.error(err);
      // If there is a server error or invalid ObjectId format, return a 500 response
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };


// Controller to update an event
exports.updateEvent = async (req, res) => {
    const { eventId } = req.params; 
    const { title, description, date, category, location } = req.body; 
  
    try {
      // Find the event by its ID
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Update event fields
      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.category = category || event.category;
      event.location = location || event.location;
  
      // Save the updated event
      const updatedEvent = await event.save();
  
      // Respond with the updated event data
      res.status(200).json({
        message: 'Event updated successfully.',
        event: updatedEvent,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };

  // Controller to delete an event
exports.deleteEvent = async (req, res) => {
    const { eventId } = req.params; 
  
    try {
      // Find the event to be deleted
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Remove event reference from the organizer's eventsCreated list
      const organizer = await UserModel.findById(event.organizer);
      if (organizer) {
        // Remove the event ID from the user's eventsCreated array
        organizer.eventsCreated = organizer.eventsCreated.filter(
          (eventId) => eventId.toString() !== event._id.toString()
        );
        await organizer.save(); // Save the updated user document
      }
  
      // Delete the event
      await event.deleteOne();
  
      // Respond with success message
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };

  //join event 
  // Controller to allow a user to join an event
exports.joinEvent = async (req, res) => {
    const { eventId ,userId} = req.params; // Get the eventId from the request parameters
  
    try {
      // Find the event by its ID
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      // Check if the user is already an attendee of the event
      if (event.attendees.includes(userId)) {
        return res.status(400).json({ message: 'You have already joined this event' });
      }
  
      // Add the user to the event's attendees list
      event.attendees.push(userId);
  
      // Save the updated event
      await event.save();
  
      // Optionally, add the event to the user's eventsJoined list (if you track joined events in User schema)
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Add event to the user's eventsJoined list
      user.eventsJoined.push(event._id);
      await user.save();
  
      // Respond with a success message
      res.status(200).json({
        message: 'You have successfully joined the event.',
        event,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };

  // Controller to get the attendees of a specific event by event ID
exports.getEventAttendees = async (req, res) => {
    const { eventId } = req.params; 
  
    try {
     
      const event = await Event.findById(eventId).populate('attendees', 'name email'); 
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      
      if (event.attendees.length === 0) {
        return res.status(200).json({ message: 'No attendees for this event.' });
      }
  
      
      res.status(200).json({
        message: 'List of attendees for this event:',
        event:{
            title: event.title,
            description: event.description,
            date: event.date,
            category: event.category,
            location: event.location,
           

        },
        attendees: event.attendees,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again.' });
    }
  };


