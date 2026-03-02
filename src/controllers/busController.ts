import { Request, Response } from 'express';
import Bus from '../models/Bus';
import BusLocation from '../models/BusLocation';

// Helper function to find current stop based on bus location
// Only uses coordinates to determine which stop the bus is at
function findCurrentStop(
  busLocation: number[], 
  stops: any[]
): {
  stopOrder: number;
  name: string;
  isAtStop: boolean;
} | null {
  if (!busLocation || !stops || stops.length === 0) return null;

  const [busLon, busLat] = busLocation;
  let closestStop: any = null;
  let minDistance = Infinity;
  const THRESHOLD = 0.05; // ~50 meters in coordinate terms

  // Find the closest stop based on coordinates
  stops.forEach(stop => {
    // Skip if stop doesn't have location
    if (!stop.location || !stop.location.coordinates) return;
    
    const [stopLon, stopLat] = stop.location.coordinates;
    
    // Simple Euclidean distance calculation
    const distance = Math.sqrt(
      Math.pow(busLat - stopLat, 2) + 
      Math.pow(busLon - stopLon, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestStop = stop;
    }
  });

  // If we found a closest stop
  if (closestStop) {
    return {
      stopOrder: closestStop.stopOrder,
      name: closestStop.name,
      isAtStop: minDistance < THRESHOLD // True if bus is very close to stop
    };
  }

  return null;
}

// @desc    Get all buses with their latest locations
// @route   GET /api/buses
export const getAllBuses = async (req: Request, res: Response) => {
  try {
    // Get only ACTIVE buses, sorted by bus number
    const buses = await Bus.find({ status: 'ACTIVE' }).sort({ number: 1 });
    
    // Get latest location for each bus
    const busesWithLocation = await Promise.all(
      buses.map(async (bus) => {
        const latestLocation = await BusLocation.findOne({ busId: bus._id })
          .sort({ timestamp: -1 }) // Get most recent location
          .lean();
        
        return {
          ...bus.toObject(),
          currentLocation: latestLocation || null
        };
      })
    );

    res.json({
      success: true,
      count: busesWithLocation.length,
      data: busesWithLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get single bus by ID with latest location
// @route   GET /api/buses/:id
export const getBusById = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Get most recent location for this bus
    const latestLocation = await BusLocation.findOne({ busId: bus._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...bus.toObject(),
        currentLocation: latestLocation || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get buses by type with latest locations
// @route   GET /api/buses/type/:type
export const getBusesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    // Find buses of specific type that are ACTIVE
    const buses = await Bus.find({ 
      type: type.toUpperCase(),
      status: 'ACTIVE' 
    }).sort({ number: 1 });

    // Add latest location to each bus
    const busesWithLocation = await Promise.all(
      buses.map(async (bus) => {
        const latestLocation = await BusLocation.findOne({ busId: bus._id })
          .sort({ timestamp: -1 })
          .lean();
        
        return {
          ...bus.toObject(),
          currentLocation: latestLocation || null
        };
      })
    );

    res.json({
      success: true,
      count: busesWithLocation.length,
      data: busesWithLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses by type',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Search buses by number, name, or route
// @route   GET /api/buses/search?query=:query&type=:type
export const searchBuses = async (req: Request, res: Response) => {
  try {
    const { query, type } = req.query;
    
    // Build search query
    let searchQuery: any = {
      $or: [
        { number: { $regex: query, $options: 'i' } }, // Case-insensitive search
        { name: { $regex: query, $options: 'i' } },
        { route: { $regex: query, $options: 'i' } }
      ]
    };

    // Filter by type if specified
    if (type && type !== 'ALL') {
      searchQuery.type = type;
    }

    const buses = await Bus.find(searchQuery).sort({ number: 1 });

    // Add latest location to each bus
    const busesWithLocation = await Promise.all(
      buses.map(async (bus) => {
        const latestLocation = await BusLocation.findOne({ busId: bus._id })
          .sort({ timestamp: -1 })
          .lean();
        
        return {
          ...bus.toObject(),
          currentLocation: latestLocation || null
        };
      })
    );

    res.json({
      success: true,
      count: busesWithLocation.length,
      data: busesWithLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching buses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get bus route with stops and current location
// @route   GET /api/buses/:busId/route
export const getBusRoute = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;
    
    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found' 
      });
    }

    // Get latest location
    const latestLocation = await BusLocation.findOne({ busId: bus._id })
      .sort({ timestamp: -1 })
      .lean();

    // Sort stops by stopOrder
    const sortedStops = bus.stops ? bus.stops.sort((a, b) => a.stopOrder - b.stopOrder) : [];

    // Find current stop based on location (if location exists)
    let currentStopInfo = null;
    if (latestLocation && latestLocation.location && sortedStops.length > 0) {
      currentStopInfo = findCurrentStop(
        latestLocation.location.coordinates,
        sortedStops
      );
    }

    // Format stops for response
    const mappedStops = sortedStops.map((stop) => ({
      id: stop.stopOrder,
      name: stop.name,
      platform: stop.platform || 'N/A',
      location: stop.location?.coordinates || [0, 0], // Default if no location
    }));

    const routeData = {
      busId: bus._id,
      busNumber: bus.number,
      busName: bus.name,
      driverName: bus.driverName,
      startPoint: bus.startPoint || { name: 'Starting Point', platform: 'N/A' },
      stops: mappedStops,
      destination: bus.destination || 'Destination',
      currentLocation: latestLocation ? {
        coordinates: latestLocation.location.coordinates,
        timestamp: latestLocation.timestamp
      } : null,
      currentStop: currentStopInfo,
      lastUpdated: latestLocation?.timestamp?.toISOString() || new Date().toISOString()
    };

    res.json({ success: true, data: routeData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bus route',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update bus location (real-time)
// @route   POST /api/buses/:busId/location
export const updateBusLocation = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;
    const { coordinates } = req.body; // Expecting [longitude, latitude]

    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Expected [longitude, latitude]'
      });
    }

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found' 
      });
    }

    // Create new location record
    const busLocation = await BusLocation.create({
      busId,
      busNumber: bus.number,
      location: {
        type: 'Point',
        coordinates
      },
      timestamp: new Date()
    });

    // Find current stop based on new location
    let currentStopInfo = null;
    if (bus.stops && bus.stops.length > 0) {
      currentStopInfo = findCurrentStop(coordinates, bus.stops);
    }

    res.status(201).json({ 
      success: true, 
      data: {
        location: busLocation,
        currentStop: currentStopInfo
      },
      message: 'Location updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating location',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get bus live location
// @route   GET /api/buses/:busId/live-location
export const getBusLiveLocation = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;

    // Get most recent location
    const location = await BusLocation.findOne({ busId })
      .sort({ timestamp: -1 })
      .lean();

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location data found for this bus'
      });
    }

    const bus = await Bus.findById(busId);
    
    // Find current stop
    let currentStopInfo = null;
    if (bus && bus.stops && bus.stops.length > 0 && location.location) {
      currentStopInfo = findCurrentStop(
        location.location.coordinates,
        bus.stops
      );
    }

    res.json({
      success: true,
      data: {
        ...location,
        currentStop: currentStopInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live location',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
export const createBus = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.create(req.body);
    
    res.status(201).json({
      success: true,
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bus',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
export const updateBus = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated document
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bus',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
export const deleteBus = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Also delete associated locations
    await BusLocation.deleteMany({ busId: bus._id });

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bus',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};