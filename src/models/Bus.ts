import mongoose, { Schema, Document } from 'mongoose';

// Interface for bus stop
export interface IBusStop {
  stopOrder: number;        // Order of stop on route
  name: string;             // Stop name
  platform?: string;        // Platform number
  // location is optional - coordinates of the stop [longitude, latitude]
  location?: {
    type: string;
    coordinates: number[];
  };
}

// Interface for Bus document
export interface IBus extends Document {
  number: string;           // Bus number (e.g., "BUS-001")
  name: string;             // Bus name (e.g., "Campus Shuttle")
  route: string;            // Route description
  type: 'LOCAL' | 'OUTSIDER'; // Bus type
  driverName?: string;      // Driver's name
  driverContact?: string;   // Driver's contact number
  capacity: number;         // Passenger capacity
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'; // Bus status
  stops: IBusStop[];        // Array of stops on route
  startPoint: {
    name: string;
    platform?: string;
  };
  destination: string;      // Final destination
  createdAt: Date;
  updatedAt: Date;
}

// Schema for bus stop
const BusStopSchema = new Schema<IBusStop>({
  stopOrder: { type: Number, required: true },
  name: { type: String, required: true },
  platform: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
});

// Schema for bus
const BusSchema = new Schema<IBus>({
  number: { 
    type: String, 
    required: [true, 'Bus number is required'],
    unique: true 
  },
  name: { 
    type: String, 
    required: [true, 'Bus name is required'] 
  },
  route: { 
    type: String, 
    required: [true, 'Route is required'] 
  },
  type: { 
    type: String, 
    enum: ['LOCAL', 'OUTSIDER'], 
    required: true 
  },
  driverName: { type: String },
  driverContact: { type: String },
  capacity: { 
    type: Number, 
    required: true, 
    default: 50 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], 
    default: 'ACTIVE' 
  },
  stops: [BusStopSchema],
  startPoint: {
    name: { type: String, required: true },
    platform: { type: String }
  },
  destination: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  collection: 'buses'
});

// Create geospatial index for stop locations
BusSchema.index({ 'stops.location': '2dsphere' });

const BusModel = mongoose.model<IBus>('Bus', BusSchema);
export default BusModel;