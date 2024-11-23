// server.js
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const express = require('express');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000', 'https://uvrc-web.vercel.app/'], // Add your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply middlewares
server.use(cors(corsOptions));
server.use(express.static(path.join(__dirname, 'public')));
server.use(middlewares);
server.use('/api', router); // Add /api prefix to all routes

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server with CORS is running on port ${PORT}`);
});