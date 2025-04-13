const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = socketIO(server);



app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');

// Use Routes
app.use('/auth', authRoutes);
app.use('/stock', stockRoutes);

const PORT = 5001;
server.listen(PORT, () => {
    console.log("Running on port " + PORT);
});