"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locationController_1 = require("../controllers/locationController");
const router = express_1.default.Router();
// Location update endpoint
router.post('/location/update', locationController_1.updateBusLocation);
// Stop management
router.get('/stops', locationController_1.getAllStops);
router.post('/stops', locationController_1.createStop);
// Bus live location
router.get('/buses/:busId/location', locationController_1.getBusLiveLocation);
exports.default = router;
