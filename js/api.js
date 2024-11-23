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
