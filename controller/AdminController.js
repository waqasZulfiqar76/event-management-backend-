const Event = require("../model/EventModel");
const User = require("../model/UserModel");

// Approve an event. Only an admin can approve an event.

exports.approveEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the event is already approved
    if (event.approvalStatus === "approved") {
      return res.status(400).json({ message: "Event is already approved" });
    }

    // Set the approval status to 'approved'
    event.approvalStatus = "approved";
    await event.save();

    res.status(200).json({ message: "Event approved successfully", event });
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

//  Disapprove an event. Only an admin can disapprove an event.

exports.disapproveEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the event is already disapproved
    if (event.approvalStatus === "pending") {
      return res.status(400).json({ message: "Event is already disapproved" });
    }

    event.approvalStatus = "pending";
    await event.save();

    res.status(200).json({ message: "Event disapproved successfully", event });
  } catch (error) {
    console.error("Error disapproving event:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Fetch all users and populate their created and joined events
    const users = await User.find()
      .populate("eventsCreated")
      .populate("eventsJoined");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Initialize statistics
    let totalUsers = users.length;
    let totalEventsCreated = 0;
    let totalEventsJoined = 0;
    let totalUpcomingCreatedEvents = 0;
    let totalUpcomingJoinedEvents = 0;

    // Loop through all users and calculate stats
    users.forEach((user) => {
      // Count total events created and joined
      totalEventsCreated += user.eventsCreated.length;
      totalEventsJoined += user.eventsJoined.length;

      // Count upcoming events created and joined
      totalUpcomingCreatedEvents += user.eventsCreated.filter(
        (event) => new Date(event.date) > new Date()
      ).length;

      totalUpcomingJoinedEvents += user.eventsJoined.filter(
        (event) => new Date(event.date) > new Date()
      ).length;
    });

    // Send the stats as a response
    res.status(200).json({
      totalUsers,
      totalCreatedEvents: totalEventsCreated,
      totalJoinedEvents: totalEventsJoined,
      upcomingCreatedEvents: totalUpcomingCreatedEvents,
      totalUpcomingJoinedEvents,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
