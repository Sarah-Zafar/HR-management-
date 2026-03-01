export const getAllEvents = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // We generate some dynamic mock events near the current date to naturally sync both pages
    return [
        {
            id: 1,
            title: "Daily Sync",
            type: "meeting",
            time: "10:00 AM",
            description: "Daily team sync regarding ongoing tasks.",
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: 2,
            title: "Submit Report",
            type: "deadline",
            time: "05:00 PM",
            description: "End of day progress report submission.",
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: 3,
            title: "1-on-1 Review",
            type: "meeting",
            time: "02:00 PM",
            description: "Monthly performance review and feedback session.",
            date: new Date(currentYear, currentMonth, today.getDate() + 2)
        },
        {
            id: 4,
            title: "Team Standup",
            type: "meeting",
            time: "09:00 AM",
            description: "Weekly review of all active finance modules and FRS performance metrics.",
            date: new Date(currentYear, currentMonth, today.getDate() + 5)
        },
        {
            id: 5,
            title: "Company Retreat",
            type: "holiday",
            time: "All Day Event",
            description: "Annual organization-wide wellness retreat. All operations suspended.",
            date: new Date(currentYear, currentMonth, today.getDate() + 12)
        },
        {
            id: 6,
            title: "Q3 Tax Filings",
            type: "deadline",
            time: "Closes at 05:00 PM",
            description: "Final submission date for all corporate documentation.",
            date: new Date(currentYear, currentMonth, today.getDate() + 18)
        }
    ];
};

export const getEventsForDay = (day, month, year) => {
    const allEvents = getAllEvents();
    return allEvents.filter(event =>
        event.date.getDate() === day &&
        event.date.getMonth() === month &&
        event.date.getFullYear() === year
    );
};

export const getUpcomingEvents = (limit = 3) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const allEvents = getAllEvents();
    const upcoming = allEvents.filter(event => event.date >= today);
    // Sort array closest to today first
    upcoming.sort((a, b) => a.date - b.date);

    return upcoming.slice(0, limit);
};
