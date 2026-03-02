"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const busController_1 = require("../controllers/busController");
const router = express_1.default.Router();
// ============ BUS ROUTES ============
// Get all buses with locations
router.get('/buses', busController_1.getAllBuses);
// Search buses
router.get('/buses/search', busController_1.searchBuses);
// Get buses by type
router.get('/buses/type/:type', busController_1.getBusesByType);
// Get single bus
router.get('/buses/:id', busController_1.getBusById);
// Create new bus
router.post('/buses', busController_1.createBus);
// Update bus
router.put('/buses/:id', busController_1.updateBus);
// Delete bus
router.delete('/buses/:id', busController_1.deleteBus);
// ============ BUS ROUTE & LOCATION ROUTES ============
// Get bus route with stops and current location
router.get('/buses/:busId/route', busController_1.getBusRoute);
// Update bus location (real-time)
router.post('/buses/:busId/location', busController_1.updateBusLocation);
// Get bus live location
router.get('/buses/:busId/live-location', busController_1.getBusLiveLocation);
exports.default = router;
