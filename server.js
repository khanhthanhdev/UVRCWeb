const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const path = require('path');

const server = express();

// Create JSON Server router with custom options
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
    static: '.',
    noCors: false,
    readOnly: false,
    bodyParser: true
});

// Enable CORS for development and Vercel deployment
server.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'https://uvrc-web.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: false // Disable credentials requirement
}));

// Additional CORS headers for Vercel
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    next();
});

// Set default middlewares
server.use(middlewares);

// Add logging middleware
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API base endpoint
server.get('/api', (req, res) => {
    res.json({
        version: '1.0.0',
        endpoints: {
            team: '/api/team',
            pmmatches: '/api/pmmatches',
            qmmatches: '/api/qmmatches',
            pomatches: '/api/pomatches',
            results: '/api/results'
        },
        environment: process.env.VERCEL ? 'production' : 'development'
    });
});

// Mount the router under /api
server.use('/api', router);

// Add health check endpoint
server.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add error handling middleware
server.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Handle 404s
server.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not Found' });
});

// Start server if not running as serverless
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for serverless
module.exports = server;
