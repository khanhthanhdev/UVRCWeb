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

// Mount json-server router under /api
server.use('/api', (req, res, next) => {
    // Ensure db.json exists and is readable
    try {
        require('./db.json');
        next();
    } catch (error) {
        console.error('Error reading db.json:', error);
        res.status(500).json({ error: 'Database file not accessible' });
    }
}, router);

// Health check endpoint
server.get('/health', (req, res) => {
    res.json({ 
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'production' : 'development'
    });
});

// Handle all other routes by serving index.html
server.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message,
        path: req.path
    });
});

// Export for Vercel
if (process.env.VERCEL) {
    module.exports = server;
} else {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('\nAvailable endpoints:');
        console.log('GET /api - API documentation');
        console.log('GET /api/team - Team information');
        console.log('GET /api/pmmatches - PM matches');
        console.log('GET /api/qmmatches - QM matches');
        console.log('GET /api/pomatches - PO matches');
        console.log('GET /api/results - Results');
    });
}
