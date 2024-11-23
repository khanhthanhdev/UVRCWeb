const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const server = express();

// Initialize database
const DB_FILE = process.env.VERCEL 
    ? path.join('/tmp', 'db.json')  // Use /tmp in Vercel
    : path.join(__dirname, 'db.json');

// Ensure db.json exists and is writable
if (process.env.VERCEL) {
    // In Vercel, copy db.json to /tmp on startup
    try {
        const sourceDb = path.join(__dirname, 'db.json');
        if (fs.existsSync(sourceDb)) {
            fs.copyFileSync(sourceDb, DB_FILE);
        } else {
            // Initialize with empty data
            fs.writeFileSync(DB_FILE, JSON.stringify({
                team: [],
                pmmatches: [],
                qmmatches: [],
                pomatches: [],
                results: []
            }, null, 2));
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
} else if (!fs.existsSync(DB_FILE)) {
    // In development, create db.json if it doesn't exist
    fs.writeFileSync(DB_FILE, JSON.stringify({
        team: [],
        pmmatches: [],
        qmmatches: [],
        pomatches: [],
        results: []
    }, null, 2));
}

// Create JSON Server router with custom options
const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults({
    static: '.',
    noCors: false,
    readOnly: false,
    bodyParser: true
});

// Enable CORS for development and Vercel deployment
server.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'https://uvrc-web.vercel.app'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Additional security headers
server.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
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
        environment: process.env.VERCEL ? 'production' : 'development',
        dbPath: DB_FILE
    });
});

// Mount json-server router under /api
server.use('/api', (req, res, next) => {
    // Check if we can access the database
    try {
        const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        // Validate database structure
        const requiredCollections = ['team', 'pmmatches', 'qmmatches', 'pomatches', 'results'];
        const missingCollections = requiredCollections.filter(collection => !db[collection]);
        
        if (missingCollections.length > 0) {
            // Initialize missing collections
            missingCollections.forEach(collection => {
                db[collection] = [];
            });
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        }
        next();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Database error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            path: req.path,
            dbPath: DB_FILE
        });
    }
}, router);

// Health check endpoint
server.get('/health', (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        res.json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            environment: process.env.VERCEL ? 'production' : 'development',
            database: {
                exists: true,
                path: DB_FILE,
                collections: Object.keys(db),
                size: fs.statSync(DB_FILE).size
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            error: 'Database not accessible',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            path: DB_FILE
        });
    }
});

// Handle all other routes by serving index.html
server.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Error handling middleware
server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        path: req.path
    });
});

// Export for Vercel
module.exports = server;
