async function generateQualificationMatches(roundsPerTeam) {
    // Get all teams
    const teams = await api.loadTeams();
    if (!teams || teams.length === 0) {
        throw new Error('No teams available');
    }

    // Reset team stats for new qualification round
    for (const team of teams) {
        team.rp = 0;  // Ranking Points
        team.mp = 0;  // Match Points (total score)
        team.avg = 0; // Average score
        team.pen = 0; // Penalty Points
        await api.saveTeam(team);
    }

    // Calculate total matches needed
    const totalMatches = Math.ceil((teams.length * roundsPerTeam) / 2);
    const matches = [];

    // Generate random matches
    for (let i = 0; i < totalMatches; i++) {
        const availableTeams = teams.filter(team => 
            matches.filter(m => 
                m.red1 === team.teamcode || m.red2 === team.teamcode || 
                m.blue1 === team.teamcode || m.blue2 === team.teamcode
            ).length < roundsPerTeam
        );

        if (availableTeams.length < 4) break;

        // Randomly select four teams (2 for each alliance)
        const redTeams = [];
        const blueTeams = [];

        // Select red alliance teams
        for (let j = 0; j < 2; j++) {
            const index = Math.floor(Math.random() * availableTeams.length);
            redTeams.push(availableTeams[index]);
            availableTeams.splice(index, 1);
        }

        // Select blue alliance teams
        for (let j = 0; j < 2; j++) {
            const index = Math.floor(Math.random() * availableTeams.length);
            blueTeams.push(availableTeams[index]);
            availableTeams.splice(index, 1);
        }

        // Create match with the exact format from db.json
        const match = {
            id: `PM${i + 1}`,
            yelblue: "0",
            yelred: "0",
            redblue: "0",
            redred: "0",
            multiplierred: "1",
            multiplierblue: "1",
            penred: "0",
            penblue: "0",
            scorered: "0",
            scoreblue: "0",
            ascorered: "0",
            ascoreblue: "0",
            hexred: "0",
            hexblue: "0",
            wwastered: "",
            wwasteblue: "",
            circlered: "",
            circleblue: "",
            rwastered: "",
            rwasteblue: "",
            wwaterred: "",
            wwaterblue: "",
            wastehpred: "",
            wastehpblue: "",
            waterhpred: "",
            waterhpblue: "",
            watercarred: "",
            watercarblue: "",
            red1: redTeams[0].teamcode,
            red2: redTeams[1].teamcode,
            blue1: blueTeams[0].teamcode,
            blue2: blueTeams[1].teamcode,
            ascore: "0",
            fscorered: "0",
            fscoreblue: "0"
        };

        matches.push(match);
    }

    // Save all matches
    for (const match of matches) {
        await api.savePMMatch(match);
    }

    showMessage(`Generated ${matches.length} practice matches`, 'success');
}
