"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBus = exports.updateBus = exports.createBus = exports.getBusLiveLocation = exports.updateBusLocation = exports.getBusRoute = exports.searchBuses = exports.getBusesByType = exports.getBusById = exports.getAllBuses = void 0;
const Bus_1 = __importDefault(require("../models/Bus"));
const BusLocation_1 = __importDefault(require("../models/BusLocation"));
// Helper function to find current stop based on bus location
// Only uses coordinates to determine which stop the bus is at
function findCurrentStop(busLocation, stops) {
    if (!busLocation || !stops || stops.length === 0)
        return null;
    const [busLon, busLat] = busLocation;
    let closestStop = null;
    let minDistance = Infinity;
    const THRESHOLD = 0.05; // ~50 meters in coordinate terms
    // Find the closest stop based on coordinates
    stops.forEach(stop => {
        // Skip if stop doesn't have location
        if (!stop.location || !stop.location.coordinates)
            return;
        const [stopLon, stopLat] = stop.location.coordinates;
        // Simple Euclidean distance calculation
        const distance = Math.sqrt(Math.pow(busLat - stopLat, 2) +
            Math.pow(busLon - stopLon, 2));
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
const getAllBuses = async (req, res) => {
    try {
        // Get only ACTIVE buses, sorted by bus number
        const buses = await Bus_1.default.find({ status: 'ACTIVE' }).sort({ number: 1 });
        // Get latest location for each bus
        const busesWithLocation = await Promise.all(buses.map(async (bus) => {
            const latestLocation = await BusLocation_1.default.findOne({ busId: bus._id })
                .sort({ timestamp: -1 }) // Get most recent location
                .lean();
            return {
                ...bus.toObject(),
                currentLocation: latestLocation || null
            };
        }));
        res.json({
            success: true,
            count: busesWithLocation.length,
            data: busesWithLocation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching buses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllBuses = getAllBuses;
// @desc    Get single bus by ID with latest location
// @route   GET /api/buses/:id
const getBusById = async (req, res) => {
    try {
        const bus = await Bus_1.default.findById(req.params.id);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }
        // Get most recent location for this bus
        const latestLocation = await BusLocation_1.default.findOne({ busId: bus._id })
            .sort({ timestamp: -1 })
            .lean();
        res.json({
            success: true,
            data: {
                ...bus.toObject(),
                currentLocation: latestLocation || null
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bus',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBusById = getBusById;
// @desc    Get buses by type with latest locations
// @route   GET /api/buses/type/:type
const getBusesByType = async (req, res) => {
    try {
        const { type } = req.params;
        // Find buses of specific type that are ACTIVE
        const buses = await Bus_1.default.find({
            type: type.toUpperCase(),
            status: 'ACTIVE'
        }).sort({ number: 1 });
        // Add latest location to each bus
        const busesWithLocation = await Promise.all(buses.map(async (bus) => {
            const latestLocation = await BusLocation_1.default.findOne({ busId: bus._id })
                .sort({ timestamp: -1 })
                .lean();
            return {
                ...bus.toObject(),
                currentLocation: latestLocation || null
            };
        }));
        res.json({
            success: true,
            count: busesWithLocation.length,
            data: busesWithLocation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching buses by type',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBusesByType = getBusesByType;
// @desc    Search buses by number, name, or route
// @route   GET /api/buses/search?query=:query&type=:type
const searchBuses = async (req, res) => {
    try {
        const { query, type } = req.query;
        // Build search query
        let searchQuery = {
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
        const buses = await Bus_1.default.find(searchQuery).sort({ number: 1 });
        // Add latest location to each bus
        const busesWithLocation = await Promise.all(buses.map(async (bus) => {
            const latestLocation = await BusLocation_1.default.findOne({ busId: bus._id })
                .sort({ timestamp: -1 })
                .lean();
            return {
                ...bus.toObject(),
                currentLocation: latestLocation || null
            };
        }));
        res.json({
            success: true,
            count: busesWithLocation.length,
            data: busesWithLocation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching buses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.searchBuses = searchBuses;
// @desc    Get bus route with stops and current location
// @route   GET /api/buses/:busId/route
const getBusRoute = async (req, res) => {
    try {
        const { busId } = req.params;
        // Find the bus
        const bus = await Bus_1.default.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }
        // Get latest location
        const latestLocation = await BusLocation_1.default.findOne({ busId: bus._id })
            .sort({ timestamp: -1 })
            .lean();
        // Sort stops by stopOrder
        const sortedStops = bus.stops ? bus.stops.sort((a, b) => a.stopOrder - b.stopOrder) : [];
        // Find current stop based on location (if location exists)
        let currentStopInfo = null;
        if (latestLocation && latestLocation.location && sortedStops.length > 0) {
            currentStopInfo = findCurrentStop(latestLocation.location.coordinates, sortedStops);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bus route',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBusRoute = getBusRoute;
// @desc    Update bus location (real-time)
// @route   POST /api/buses/:busId/location
const updateBusLocation = async (req, res) => {
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
        const bus = await Bus_1.default.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }
        // Create new location record
        const busLocation = await BusLocation_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateBusLocation = updateBusLocation;
// @desc    Get bus live location
// @route   GET /api/buses/:busId/live-location
const getBusLiveLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        // Get most recent location
        const location = await BusLocation_1.default.findOne({ busId })
            .sort({ timestamp: -1 })
            .lean();
        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'No location data found for this bus'
            });
        }
        const bus = await Bus_1.default.findById(busId);
        // Find current stop
        let currentStopInfo = null;
        if (bus && bus.stops && bus.stops.length > 0 && location.location) {
            currentStopInfo = findCurrentStop(location.location.coordinates, bus.stops);
        }
        res.json({
            success: true,
            data: {
                ...location,
                currentStop: currentStopInfo
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching live location',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBusLiveLocation = getBusLiveLocation;
// @desc    Create new bus
// @route   POST /api/buses
const createBus = async (req, res) => {
    try {
        const bus = await Bus_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: bus
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating bus',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createBus = createBus;
// @desc    Update bus
// @route   PUT /api/buses/:id
const updateBus = async (req, res) => {
    try {
        const bus = await Bus_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true } // Return updated document
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating bus',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateBus = updateBus;
// @desc    Delete bus
// @route   DELETE /api/buses/:id
const deleteBus = async (req, res) => {
    try {
        const bus = await Bus_1.default.findByIdAndDelete(req.params.id);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }
        // Also delete associated locations
        await BusLocation_1.default.deleteMany({ busId: bus._id });
        res.json({
            success: true,
            message: 'Bus deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting bus',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteBus = deleteBus;
