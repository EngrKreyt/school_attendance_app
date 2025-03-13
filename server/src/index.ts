import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import classRoutes from './routes/class';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.245:3000', 'http://192.168.0.245:3001'],
  credentials: true
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB before starting the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 