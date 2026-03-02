import mongoose, { Schema, Document } from 'mongoose';

// Interface for bus location document
export interface IBusLocation extends Document {
  busId: mongoose.Types.ObjectId; // Reference to Bus
  busNumber: string;               // Bus number for quick reference
  location: {
    type: string;
    coordinates: number[];         // [longitude, latitude]
  };
  timestamp: Date;                 // When this location was recorded
  createdAt: Date;
  updatedAt: Date;
}

const BusLocationSchema = new Schema<IBusLocation>({
  busId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Bus', 
    required: true 
  },
  busNumber: { 
    type: String, 
    required: true 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { 
      type: [Number], 
      required: true,
      validate: {
        validator: function(coords: number[]) {
          return coords && coords.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    required: true 
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  collection: 'bus_locations'
});

// Create indexes for faster queries
BusLocationSchema.index({ busId: 1, timestamp: -1 }); // For finding latest location by bus
BusLocationSchema.index({ 'location': '2dsphere' });  // For geospatial queries

const BusLocationModel = mongoose.model<IBusLocation>('BusLocation', BusLocationSchema);
export default BusLocationModel;