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

    // Teams
    async loadTeams() {
        return await this.read('teams');
    },
    async loadTeam(id) {
        return await this.read('teams', id);
    },
    async saveTeam(data) {
        if (data.id) {
            return await this.update('teams', data.id, data);
        }
        return await this.create('teams', data);
    },
    async deleteTeam(id) {
        return await this.delete('teams', id);
    },

    // QM Matches
    async loadQMMatches() {
        return await this.read('qmmatches');
    },
    async loadQMMatch(id) {
        return await this.read('qmmatches', id);
    },
    async saveQMMatch(data) {
        if (data.id) {
            return await this.update('qmmatches', data.id, data);
        }
        return await this.create('qmmatches', data);
    },
    async deleteQMMatch(id) {
        return await this.delete('qmmatches', id);
    },

    // PM Matches
    async loadPMMatches() {
        return await this.read('pmmatches');
    },
    async loadPMMatch(id) {
        return await this.read('pmmatches', id);
    },
    async savePMMatch(data) {
        if (data.id) {
            return await this.update('pmmatches', data.id, data);
        }
        return await this.create('pmmatches', data);
    },
    async deletePMMatch(id) {
        return await this.delete('pmmatches', id);
    },

    // PO Matches
    async loadPOMatches() {
        return await this.read('pomatches');
    },
    async loadPOMatch(id) {
        return await this.read('pomatches', id);
    },
    async savePOMatch(data) {
        if (data.id) {
            return await this.update('pomatches', data.id, data);
        }
        return await this.create('pomatches', data);
    },
    async deletePOMatch(id) {
        return await this.delete('pomatches', id);
    },

    // Results
    async loadResults() {
        return await this.read('results');
    },
    async loadResult(id) {
        return await this.read('results', id);
    },
    async saveResult(data) {
        if (data.id) {
            return await this.update('results', data.id, data);
        }
        return await this.create('results', data);
    },
    async deleteResult(id) {
        return await this.delete('results', id);
    },

    // Error handling helper
    handleError(error) {
        console.error('API Error:', error);
        config.showError(error.message || 'An error occurred while processing your request');
    }
};
