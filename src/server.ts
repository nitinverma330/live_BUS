import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import busRoutes from './routes/busRoutes';
import locationRoutes from './routes/locationRoutes';
import authRoutes from './routes/authRoutes'; // Add this import

dotenv.config();

const app = express();

// Convert PORT to number properly
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', busRoutes);
app.use('/api', locationRoutes);
app.use('/api/auth', authRoutes); // Add auth routes

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'College Bus Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Create 2dsphere index for stops
      const db = mongoose.connection.db;
      if (db) {
        const collection = db.collection('stops');
        await collection.createIndex({ locationArea: '2dsphere' });
        console.log('✅ 2dsphere index created on stops collection');
        
        // Create email index for users
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('✅ Email index created on users collection');
      }
    } catch (error) {
      console.error('Error creating indexes:', error);
    }

    // Start server - LISTEN ON ALL INTERFACES
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;