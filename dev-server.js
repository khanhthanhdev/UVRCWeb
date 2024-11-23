const server = require('./server');

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
