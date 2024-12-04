const express = require('express');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, joinEvent, getEventAttendees, getEventsByOrganizer } = require('../controller/EventController');
const router = express.Router();

// Route for user signup
router.post('/create-event', createEvent);
router.get('/get-events', getAllEvents);
router.get('/get-event/:eventId', getEventById);
router.get('/get-organizer-event/:organizerId', getEventsByOrganizer);
router.get('/:eventId/attendees', getEventAttendees);
router.put('/update-event/:eventId', updateEvent);
router.delete('/delete-event/:eventId', deleteEvent);
router.put('/join-event/:eventId/user/:userId', joinEvent);


module.exports = router;
