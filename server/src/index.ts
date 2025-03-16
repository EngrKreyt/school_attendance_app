import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import classRoutes from './routes/class';

dotenv.config();

const app: Express = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  // Allow connections from any origin in development
  origin: '*',
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
  // Listen on all network interfaces (0.0.0.0)
  app.listen(port, '0.0.0.0', () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`To access from other devices on your network, use your computer's IP address: http://<your-ip-address>:${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 