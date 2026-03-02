import express from 'express';
import {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  searchBuses,
  getBusesByType,
  getBusRoute,
  updateBusLocation,
  getBusLiveLocation
} from '../controllers/busController';

const router = express.Router();

// ============ BUS ROUTES ============
// Get all buses with locations
router.get('/buses', getAllBuses);

// Search buses
router.get('/buses/search', searchBuses);

// Get buses by type
router.get('/buses/type/:type', getBusesByType);

// Get single bus
router.get('/buses/:id', getBusById);

// Create new bus
router.post('/buses', createBus);

// Update bus
router.put('/buses/:id', updateBus);

// Delete bus
router.delete('/buses/:id', deleteBus);

// ============ BUS ROUTE & LOCATION ROUTES ============
// Get bus route with stops and current location
router.get('/buses/:busId/route', getBusRoute);

// Update bus location (real-time)
router.post('/buses/:busId/location', updateBusLocation);

// Get bus live location
router.get('/buses/:busId/live-location', getBusLiveLocation);

export default router;