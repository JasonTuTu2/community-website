// Events data - single source of truth for all events
const eventsData = [
  {
    date: "March 15, 2024",
    dateSort: new Date("2024-03-15"),
    title: "Spring Community Garden Opening",
    description: "We're excited to announce the opening of our community garden for the spring season! Join us this Saturday at 10 AM for the grand opening ceremony. Volunteers needed for planting and maintenance.",
    image: "images/community-garden.jpg",
    alt: "Spring Community Garden Opening"
  },
  {
    date: "March 10, 2024",
    dateSort: new Date("2024-03-10"),
    title: "Community Meeting Announcement",
    description: "Our next monthly community meeting will be held on March 25th at 7 PM in the community center. Agenda items include budget review, upcoming events, and neighborhood improvements. All residents are welcome!",
    image: "images/community-meeting.jpg",
    alt: "Community Meeting Announcement"
  },
  {
    date: "March 5, 2024",
    dateSort: new Date("2024-03-05"),
    title: "Neighborhood Cleanup Day",
    description: "Join us for our annual spring neighborhood cleanup day on March 30th from 9 AM to 12 PM. We'll provide trash bags, gloves, and refreshments. Let's work together to keep our community beautiful!",
    image: "images/cleanup-day.jpg",
    alt: "Neighborhood Cleanup Day"
  },
  {
    date: "February 28, 2024",
    dateSort: new Date("2024-02-28"),
    title: "New Playground Equipment Installed",
    description: "We're thrilled to announce that new playground equipment has been installed at the community park! The new structure includes swings, climbing equipment, and a slide. Come check it out!",
    image: "images/playground.jpg",
    alt: "New Playground Equipment Installed"
  }
];

// Sort events by date (most recent first)
eventsData.sort((a, b) => b.dateSort - a.dateSort);

