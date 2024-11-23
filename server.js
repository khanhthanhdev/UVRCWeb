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
        'https://uvrc-web.vercel.app',
        /\.vercel\.app$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// Additional CORS headers for Vercel
server.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    }
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

// Handle 404s
server.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
server.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
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
