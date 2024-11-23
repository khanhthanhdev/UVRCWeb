// API functions for different match types
const api = {
    // Generic CRUD operations
    async create(endpoint, data) {
        return await config.fetchApi(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async read(endpoint, id = null) {
        const url = id ? `${endpoint}/${id}` : endpoint;
        return await config.fetchApi(url);
    },

    async update(endpoint, id, data) {
        return await config.fetchApi(`${endpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint, id) {
        return await config.fetchApi(`${endpoint}/${id}`, {
            method: 'DELETE'
        });
    },

    // QM Matches
    async loadQMMatches() {
        return await this.read('qmmatches');
    },
    async loadQMMatch(matchnum) {
        return await this.read('qmmatches', matchnum);
    },
    async saveQMMatch(matchData) {
        if (matchData.id) {
            return await this.update('qmmatches', matchData.id, matchData);
        } else {
            return await this.create('qmmatches', matchData);
        }
    },
    async deleteQMMatch(matchnum) {
        return await this.delete('qmmatches', matchnum);
    },

    // PM Matches
    async loadPMMatches() {
        return await this.read('pmmatches');
    },
    async loadPMMatch(matchnum) {
        return await this.read('pmmatches', matchnum);
    },
    async savePMMatch(matchData) {
        if (matchData.id) {
            return await this.update('pmmatches', matchData.id, matchData);
        } else {
            return await this.create('pmmatches', matchData);
        }
    },
    async deletePMMatch(matchnum) {
        return await this.delete('pmmatches', matchnum);
    },

    // PO Matches
    async loadPOMatches() {
        return await this.read('pomatches');
    },
    async loadPOMatch(matchnum) {
        return await this.read('pomatches', matchnum);
    },
    async savePOMatch(matchData) {
        if (matchData.id) {
            return await this.update('pomatches', matchData.id, matchData);
        } else {
            return await this.create('pomatches', matchData);
        }
    },
    async deletePOMatch(matchnum) {
        return await this.delete('pomatches', matchnum);
    },

    // Teams
    async loadTeams() {
        return await this.read('team');
    },
    async loadTeam(teamId) {
        return await this.read('team', teamId);
    },
    async saveTeam(teamData) {
        if (teamData.id) {
            return await this.update('team', teamData.id, teamData);
        } else {
            return await this.create('team', teamData);
        }
    },
    async deleteTeam(teamId) {
        return await this.delete('team', teamId);
    },

    // Results
    async loadResults() {
        return await this.read('results');
    },
    async loadResult(resultId) {
        return await this.read('results', resultId);
    },
    async saveResult(resultData) {
        if (resultData.id) {
            return await this.update('results', resultData.id, resultData);
        } else {
            return await this.create('results', resultData);
        }
    },
    async deleteResult(resultId) {
        return await this.delete('results', resultId);
    },

    // PO Teams
    async loadPOTeams() {
        return await this.read('poteams');
    },
    async savePOTeams(teamData) {
        if (teamData.id) {
            return await this.update('poteams', teamData.id, teamData);
        } else {
            return await this.create('poteams', teamData);
        }
    },
    async deletePOTeam(teamId) {
        return await this.delete('poteams', teamId);
    },

    // Error handling helper
    handleError(error) {
        console.error('API Error:', error);
        config.showError(error.message || 'An error occurred while processing your request');
    }
};
// Score Management System
const scoreApi = {
    // Match Score Operations
    async updateMatchScore(matchType, matchId, scoreData) {
        const endpoint = `${matchType.toLowerCase()}matches`;
        try {
            const existingMatch = await this.read(endpoint, matchId);
            const updatedData = { ...existingMatch, ...scoreData };
            const result = await this.update(endpoint, matchId, updatedData);
            
            // Update team results after score update
            if (result) {
                await this.updateTeamResults(matchType, result);
            }
            return result;
        } catch (error) {
            console.error(`Error updating ${matchType} score:`, error);
            throw error;
        }
    },

    // Get match score
    async getMatchScore(matchType, matchId) {
        const endpoint = `${matchType.toLowerCase()}matches`;
        try {
            return await this.read(endpoint, matchId);
        } catch (error) {
            console.error(`Error getting ${matchType} score:`, error);
            throw error;
        }
    },

    // Update team results based on match outcome
    async updateTeamResults(matchType, matchData) {
        try {
            // Get teams involved in the match
            const teams = this.getTeamsFromMatch(matchData);
            
            for (const team of teams) {
                const currentResults = await this.read('results', team.teamId);
                const updatedResults = this.calculateNewResults(currentResults, matchData, team.alliance);
                await this.update('results', team.teamId, updatedResults);
            }
        } catch (error) {
            console.error('Error updating team results:', error);
            throw error;
        }
    },

    // Helper function to extract teams from match data
    getTeamsFromMatch(matchData) {
        const teams = [];
        // Add red alliance teams
        if (matchData.redTeam1) teams.push({ teamId: matchData.redTeam1, alliance: 'red' });
        if (matchData.redTeam2) teams.push({ teamId: matchData.redTeam2, alliance: 'red' });
        // Add blue alliance teams
        if (matchData.blueTeam1) teams.push({ teamId: matchData.blueTeam1, alliance: 'blue' });
        if (matchData.blueTeam2) teams.push({ teamId: matchData.blueTeam2, alliance: 'blue' });
        return teams;
    },

    // Calculate new results for a team
    calculateNewResults(currentResults, matchData, alliance) {
        const newResults = { ...currentResults };
        
        // Increment matches played
        newResults.matchplayed = (newResults.matchplayed || 0) + 1;
        
        // Calculate score based on alliance
        const allianceScore = this.calculateAllianceScore(matchData, alliance);
        
        // Update total points and average
        newResults.totalPoints = (newResults.totalPoints || 0) + allianceScore;
        newResults.avg = newResults.totalPoints / newResults.matchplayed;
        
        // Update ranking points (rp)
        newResults.rp = (newResults.rp || 0) + this.calculateRankingPoints(matchData, alliance);
        
        return newResults;
    },

    // Calculate alliance score for a match
    calculateAllianceScore(matchData, alliance) {
        const prefix = alliance.toLowerCase();
        let score = 0;

        // Common fields across all match types
        const fields = {
            multiplier: parseFloat(matchData[`multiplier${prefix}`] || 0),
            yel: parseInt(matchData[`yel${prefix}`] || 0),
            red: parseInt(matchData[`red${prefix}`] || 0),
            hex: parseInt(matchData[`hex${prefix}`] || 0),
            circle: parseInt(matchData[`circle${prefix}`] || 0),
            rwaste: parseInt(matchData[`rwaste${prefix}`] || 0),
            wwaste: parseInt(matchData[`wwaste${prefix}`] || 0),
            wwater: parseInt(matchData[`wwater${prefix}`] || 0),
            wastehp: parseInt(matchData[`wastehp${prefix}`] || 0),
            waterhp: parseInt(matchData[`waterhp${prefix}`] || 0),
            watercar: parseInt(matchData[`watercar${prefix}`] || 0),
            pen: parseInt(matchData[`pen${prefix}`] || 0)
        };

        // PM Match scoring
        if (matchData.id && matchData.id.startsWith('PM')) {
            score = Math.round((
                fields.hex * 5 +
                fields.circle * 3 +
                fields.rwaste * 2 +
                fields.wwaste * 2 +
                fields.wwater * 1 +
                fields.wastehp * 3 +
                fields.waterhp * 3 +
                fields.watercar * 5 +
                fields.yel * 2 +
                fields.red * 3
            ) * fields.multiplier);
        }
        // QM Match scoring
        else if (matchData.id && matchData.id.startsWith('QM')) {
            score = Math.round((
                fields.hex * 5 +
                fields.circle * 3 +
                fields.rwaste * 2 +
                fields.wwaste * 2 +
                fields.wwater * 1 +
                fields.wastehp * 3 +
                fields.waterhp * 3 +
                fields.watercar * 5 +
                fields.yel * 2 +
                fields.red * 3
            ) * fields.multiplier);
        }
        // PO Match scoring
        else if (matchData.id && matchData.id.startsWith('PO')) {
            score = Math.round((
                fields.hex * 5 +
                fields.circle * 3 +
                fields.rwaste * 2 +
                fields.wwaste * 2 +
                fields.wwater * 1 +
                fields.wastehp * 3 +
                fields.waterhp * 3 +
                fields.watercar * 5 +
                fields.yel * 2 +
                fields.red * 3
            ) * fields.multiplier);
        }

        // Subtract penalties
        score -= fields.pen * 5;

        // Update the score in the match data
        matchData[`score${prefix}`] = score.toString();

        return score;
    },

    // Calculate ranking points for a match
    calculateRankingPoints(matchData, alliance) {
        const opposingAlliance = alliance === 'red' ? 'blue' : 'red';
        const allianceScore = parseInt(matchData[`score${alliance}`] || 0);
        const opposingScore = parseInt(matchData[`score${opposingAlliance}`] || 0);
        
        let rp = 0;
        const prefix = alliance.toLowerCase();
        const fields = {
            waterhp: parseInt(matchData[`waterhp${prefix}`] || 0),
            watercar: parseInt(matchData[`watercar${prefix}`] || 0)
        };

        // PM Match RP calculation
        if (matchData.id && matchData.id.startsWith('PM')) {
            // Win = 2 RP, Tie = 1 RP
            if (allianceScore > opposingScore) {
                rp += 2;
            } else if (allianceScore === opposingScore) {
                rp += 1;
            }

            // Bonus RP for special achievements
            if (fields.waterhp >= 2) rp += 1;
            if (fields.watercar >= 1) rp += 1;
        }
        // QM Match RP calculation
        else if (matchData.id && matchData.id.startsWith('QM')) {
            // Win = 2 RP, Tie = 1 RP
            if (allianceScore > opposingScore) {
                rp += 2;
            } else if (allianceScore === opposingScore) {
                rp += 1;
            }

            // Bonus RP for high score
            if (allianceScore >= 50) rp += 1;
        }
        // PO Match RP calculation
        else if (matchData.id && matchData.id.startsWith('PO')) {
            // Win = 3 RP, Tie = 1 RP
            if (allianceScore > opposingScore) {
                rp += 3;
            } else if (allianceScore === opposingScore) {
                rp += 1;
            }

            // Bonus RPs for special achievements
            if (fields.waterhp >= 2) rp += 1;
            if (fields.watercar >= 1) rp += 1;
        }

        return rp;
    },

    // Calculate total game elements
    calculateTotalGameElements(matchData) {
        let total = 0;
        
        if (matchData.id && matchData.id.startsWith('QM')) {
            // QM Match elements
            ['red', 'blue'].forEach(alliance => {
                total += parseInt(matchData[`multiplier${alliance}`] || 0);
                total += parseInt(matchData[`circle${alliance}`] || 0);
                total += parseInt(matchData[`hex${alliance}`] || 0);
                total += parseInt(matchData[`yelcircle${alliance}`] || 0);
            });
        } else if (matchData.id && matchData.id.startsWith('PO')) {
            // PO Match elements
            ['red', 'blue'].forEach(alliance => {
                total += parseInt(matchData[`hex${alliance}`] || 0);
                total += parseInt(matchData[`circle${alliance}`] || 0);
                total += parseInt(matchData[`rwaste${alliance}`] || 0);
                total += parseInt(matchData[`wwaste${alliance}`] || 0);
                total += parseInt(matchData[`water${alliance}`] || 0);
                total += parseInt(matchData[`wastehp${alliance}`] || 0);
                total += parseInt(matchData[`waterhp${alliance}`] || 0);
                total += parseInt(matchData[`watercar${alliance}`] || 0);
            });
        }
        
        return total;
    }
};

// Add scoreApi to the main api object
Object.assign(api, scoreApi);