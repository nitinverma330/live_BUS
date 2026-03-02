import express from 'express';
import {
  updateBusLocation,
  getAllStops,
  createStop,
  getBusLiveLocation
} from '../controllers/locationController';

const router = express.Router();

// Location update endpoint
router.post('/location/update', updateBusLocation);

// Stop management
router.get('/stops', getAllStops);
router.post('/stops', createStop);

// Bus live location
router.get('/buses/:busId/location', getBusLiveLocation);

export default router;