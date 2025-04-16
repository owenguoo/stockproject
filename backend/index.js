import WebSocket from 'ws'; 
import express from 'express';
import { Server as socketIO } from 'socket.io';
import http from 'http';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const app = express();
const server = http.createServer(app);
const io = new socketIO(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth/index.js';
import stockRoutes from './routes/stock/index.js';
import userRoutes from './routes/user/index.js';
app.use('/auth', authRoutes);
app.use('/stock', stockRoutes);
app.use('/user', userRoutes);

const FINNHUB_KEY = process.env.FINAPI;
const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);

finnhubSocket.on('open', () => {
  console.log("WebSocket Open");
});

finnhubSocket.on('message', (data) => {
  const parsed = JSON.parse(data);
  if (parsed.type === "trade") {
    io.emit("stock_update", parsed); 
  }
});

finnhubSocket.on('error', (err) => {
  console.error("Finnhub error:", err);
});

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('subscribe', (symbol) => {
    finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
    console.log(`Subscribed to: ${symbol}`);
  });

  socket.on('unsubscribe', (symbol) => {
    finnhubSocket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    console.log(`Unsubscribed from: ${symbol}`);
  });

  socket.on('unsubscribe_all', () => {
    finnhubSocket.send(JSON.stringify({ type: 'unsubscribe', symbol: '*' }));
    console.log(`Unsubscribed from all symbols`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
