const tournaments = [
    {
        title: "Nexus Valorant Championship",
        game: "Valorant",
        tournamentType: "team",
        description: "A competitive Valorant tournament for esports teams.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Mumbai Gaming Arena",
        startDate: "2026-09-15",
        endDate: "2026-09-16",
        registrationDeadline: "2026-09-10",
        entryFee: 500,
        maxParticipants: 16,
        currentParticipants: 0,
        teamSize: 5,
        status: "published"
    },

    {
        title: "Nexus BGMI Solo Clash",
        game: "BGMI",
        tournamentType: "solo",
        description: "A solo BGMI tournament for individual players.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Pune Esports Center",
        startDate: "2026-09-20",
        endDate: "2026-09-20",
        registrationDeadline: "2026-09-18",
        entryFee: 200,
        maxParticipants: 100,
        currentParticipants: 0,
        status: "published"
    },

    {
        title: "Mumbai Free Fire Cup",
        game: "Free Fire",
        tournamentType: "team",
        description: "Team-based Free Fire esports competition.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Mumbai Esports Hub",
        startDate: "2026-10-05",
        endDate: "2026-10-06",
        registrationDeadline: "2026-09-30",
        entryFee: 300,
        maxParticipants: 20,
        currentParticipants: 0,
        teamSize: 4,
        status: "published"
    },

    {
        title: "Nexus FIFA Solo League",
        game: "EA Sports FC",
        tournamentType: "solo",
        description: "One-versus-one competitive football gaming tournament.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Andheri Gaming Lounge",
        startDate: "2026-10-10",
        endDate: "2026-10-10",
        registrationDeadline: "2026-10-07",
        entryFee: 250,
        maxParticipants: 32,
        currentParticipants: 0,
        status: "published"
    },

    {
        title: "Counter Strike Elite Cup",
        game: "Counter-Strike 2",
        tournamentType: "team",
        description: "Competitive CS2 tournament featuring team-based matches.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Bangalore Esports Arena",
        startDate: "2026-10-18",
        endDate: "2026-10-19",
        registrationDeadline: "2026-10-12",
        entryFee: 1000,
        maxParticipants: 16,
        currentParticipants: 0,
        teamSize: 5,
        status: "published"
    },

    {
        title: "Nexus Rocket League Open",
        game: "Rocket League",
        tournamentType: "team",
        description: "Fast-paced Rocket League tournament for competitive teams.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Delhi Gaming Arena",
        startDate: "2026-11-01",
        endDate: "2026-11-02",
        registrationDeadline: "2026-10-26",
        entryFee: 400,
        maxParticipants: 16,
        currentParticipants: 0,
        teamSize: 3,
        status: "published"
    },

    {
        title: "Valorant Rising Stars",
        game: "Valorant",
        tournamentType: "solo",
        description: "Individual Valorant competition for emerging players.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Navi Mumbai Gaming Zone",
        startDate: "2026-11-08",
        endDate: "2026-11-08",
        registrationDeadline: "2026-11-05",
        entryFee: 150,
        maxParticipants: 64,
        currentParticipants: 0,
        status: "published"
    },

    {
        title: "Nexus PUBG PC Masters",
        game: "PUBG",
        tournamentType: "team",
        description: "Competitive PUBG PC tournament for esports teams.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Hyderabad Gaming Arena",
        startDate: "2026-11-15",
        endDate: "2026-11-16",
        registrationDeadline: "2026-11-10",
        entryFee: 750,
        maxParticipants: 20,
        currentParticipants: 0,
        teamSize: 4,
        status: "draft"
    },

    {
        title: "Tekken Battle Arena",
        game: "Tekken 8",
        tournamentType: "solo",
        description: "One-on-one fighting game tournament.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Mumbai Fighting Game Arena",
        startDate: "2026-11-22",
        endDate: "2026-11-22",
        registrationDeadline: "2026-11-19",
        entryFee: 300,
        maxParticipants: 32,
        currentParticipants: 0,
        status: "published"
    },

    {
        title: "Nexus League of Legends Cup",
        game: "League of Legends",
        tournamentType: "team",
        description: "Team-based League of Legends esports championship.",
        rules: `
        No cheating or unauthorized software is allowed.
        Each team must have 5 players.
        Players must check in 30 minutes before the match.
        Toxic behavior may result in disqualification.
        Match results cannot be changed after confirmation.
    `,
        venue: "Chennai Esports Arena",
        startDate: "2026-12-05",
        endDate: "2026-12-06",
        registrationDeadline: "2026-11-28",
        entryFee: 600,
        maxParticipants: 16,
        currentParticipants: 0,
        teamSize: 5,
        status: "published"
    }
];

export default tournaments;