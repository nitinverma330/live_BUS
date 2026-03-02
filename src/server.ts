import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import busRoutes from './routes/busRoutes';
import locationRoutes from './routes/locationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Create 2dsphere index for stops - using async/await instead of callback
      const db = mongoose.connection.db;
      if (db) {
        const collection = db.collection('stops');
        await collection.createIndex({ locationArea: '2dsphere' });
        console.log('✅ 2dsphere index created on stops collection');
      }
    } catch (error) {
      console.error('Error creating index:', error);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;