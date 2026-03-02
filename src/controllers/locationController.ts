import { Request, Response } from 'express';
import Bus from '../models/Bus';
import BusLocation from '../models/BusLocation';
import Stop from '../models/Stop';

// @desc    Update bus location and check stop entry
// @route   POST /api/location/update
export const updateBusLocation = async (req: Request, res: Response) => {
  try {
    const { busId, lat, lng } = req.body; // Removed speed

    // Validate input
    if (!busId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'busId, lat, and lng are required'
      });
    }

    // Find bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Save bus location in bus_locations collection
    const busLocation = await BusLocation.create({
      busId,
      busNumber: bus.number,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      },
      timestamp: new Date()
    });

    // Check if bus is inside any stop polygon
    const stopInside = await Stop.findOne({
      locationArea: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      }
    });

    // Update all stops status based on bus location
    if (stopInside) {
      // Bus entered this stop - set it to GREEN
      await Stop.updateOne(
        { _id: stopInside._id },
        {
          $set: {
            status: 'GREEN',
            lastBusEntered: bus.number,
            lastUpdated: new Date()
          }
        }
      );

      // Set all OTHER stops to RED
      await Stop.updateMany(
        { _id: { $ne: stopInside._id } },
        {
          $set: {
            status: 'RED',
            lastUpdated: new Date()
          }
        }
      );

      console.log(`🚌 Bus ${bus.number} entered stop: ${stopInside.name} (GREEN)`);
    } else {
      // Bus is not inside any stop - set all stops to RED
      await Stop.updateMany(
        {},
        {
          $set: {
            status: 'RED',
            lastUpdated: new Date()
          }
        }
      );

      console.log(`🚌 Bus ${bus.number} is not inside any stop (ALL RED)`);
    }

    // Get updated stop statuses for response
    const updatedStops = await Stop.find().sort({ name: 1 }).lean();

    res.json({
      success: true,
      data: {
        location: busLocation,
        stops: updatedStops,
        currentStop: stopInside ? {
          id: stopInside._id,
          name: stopInside.name,
          status: 'GREEN'
        } : null
      },
      message: stopInside ? `Bus entered ${stopInside.name}` : 'Bus not inside any stop'
    });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get all stops with current status
// @route   GET /api/stops
export const getAllStops = async (req: Request, res: Response) => {
  try {
    const stops = await Stop.find().sort({ name: 1 }).lean();
    
    res.json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stops',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Create a new stop with polygon
// @route   POST /api/stops
export const createStop = async (req: Request, res: Response) => {
  try {
    const { name, coordinates } = req.body;

    // Validate polygon (must be closed - first and last coordinates equal)
    const first = coordinates[0][0];
    const last = coordinates[0][coordinates[0].length - 1];
    
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return res.status(400).json({
        success: false,
        message: 'Polygon must be closed (first and last coordinates must be equal)'
      });
    }

    const stop = await Stop.create({
      name,
      locationArea: {
        type: 'Polygon',
        coordinates
      },
      status: 'RED',
      lastUpdated: new Date()
    });

    res.status(201).json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating stop',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get bus live location
// @route   GET /api/buses/:busId/location
export const getBusLiveLocation = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;

    const latestLocation = await BusLocation.findOne({ busId })
      .sort({ timestamp: -1 })
      .lean();

    if (!latestLocation) {
      return res.status(404).json({
        success: false,
        message: 'No location data found for this bus'
      });
    }

    // Check if bus is inside any stop
    const currentStop = await Stop.findOne({
      locationArea: {
        $geoIntersects: {
          $geometry: latestLocation.location
        }
      }
    }).lean();

    res.json({
      success: true,
      data: {
        ...latestLocation,
        currentStop: currentStop ? {
          id: currentStop._id,
          name: currentStop.name,
          status: currentStop.status
        } : null
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