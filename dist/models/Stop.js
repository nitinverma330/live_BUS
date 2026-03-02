"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const StopSchema = new mongoose_1.Schema({
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
                validator: function (coords) {
                    // Check if polygon is closed (first and last coordinates equal)
                    if (!coords || !coords[0] || coords[0].length < 4)
                        return false;
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
const StopModel = mongoose_1.default.model('Stop', StopSchema);
exports.default = StopModel;
