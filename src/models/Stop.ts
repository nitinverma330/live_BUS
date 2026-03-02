import mongoose, { Schema, Document } from 'mongoose';

// Interface for stop document
export interface IStop extends Document {
  name: string;                    // Stop name
  locationArea: {
    type: 'Polygon';
    coordinates: number[][][];     // Polygon defining the stop area
  };
  status: 'RED' | 'GREEN' | 'YELLOW'; // Current status (GREEN = bus at stop)
  lastBusEntered?: string;          // Last bus that entered this stop
  lastUpdated: Date;                // When status was last updated
  createdAt: Date;
  updatedAt: Date;
}

const StopSchema = new Schema<IStop>({
  name: { 
    type: String, 
    required: [true, 'Stop name is required'],
    unique: true,
    trim: true 
  },
  locationArea: {
    type: { 
      type: String, 
      enum: ['Polygon'], 
      required: true,
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of rings, each ring is array of [lng, lat] pairs
      required: true,
      validate: {
        validator: function(coords: number[][][]) {
          // Check if polygon is closed (first and last coordinates equal)
          if (!coords || !coords[0] || coords[0].length < 4) return false;
          const first = coords[0][0];
          const last = coords[0][coords[0].length - 1];
          return first[0] === last[0] && first[1] === last[1];
        },
        message: 'Polygon must be closed (first and last coordinates must be equal)'
      }
    }
  },
  status: { 
    type: String, 
    enum: ['RED', 'GREEN', 'YELLOW'],
    default: 'RED' // Default to RED (no bus)
  },
  lastBusEntered: { 
    type: String,
    default: null
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'stops'
});

// Create 2dsphere index for geospatial queries
StopSchema.index({ locationArea: '2dsphere' });

const StopModel = mongoose.model<IStop>('Stop', StopSchema);
export default StopModel;