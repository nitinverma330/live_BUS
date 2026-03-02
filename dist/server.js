"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const busRoutes_1 = __importDefault(require("./routes/busRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api', busRoutes_1.default);
app.use('/api', locationRoutes_1.default);
// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
        // Create 2dsphere index for stops - using async/await instead of callback
        const db = mongoose_1.default.connection.db;
        if (db) {
            const collection = db.collection('stops');
            await collection.createIndex({ locationArea: '2dsphere' });
            console.log('✅ 2dsphere index created on stops collection');
        }
    }
    catch (error) {
        console.error('Error creating index:', error);
    }
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});
exports.default = app;
