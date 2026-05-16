import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });
import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import { initSocket } from './src/config/socket.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.json({ message: 'API running' }));

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`));
