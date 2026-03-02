"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Stop_1 = __importDefault(require("./models/Stop"));
dotenv_1.default.config();
const stopsData = [
    {
        name: "Sanjay Nagar Petrol Pump",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4394, 28.3816],
                    [79.4402, 28.3816],
                    [79.4402, 28.3824],
                    [79.4394, 28.3824],
                    [79.4394, 28.3816]
                ]]
        }
    },
    {
        name: "Holi Choraha",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4452, 28.3841],
                    [79.4460, 28.3841],
                    [79.4460, 28.3849],
                    [79.4452, 28.3849],
                    [79.4452, 28.3841]
                ]]
        }
    },
    {
        name: "Trimurti Road",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4375, 28.3776],
                    [79.4383, 28.3776],
                    [79.4383, 28.3784],
                    [79.4375, 28.3784],
                    [79.4375, 28.3776]
                ]]
        }
    },
    {
        name: "Panshil Public School",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4574, 28.3908],
                    [79.4582, 28.3908],
                    [79.4582, 28.3916],
                    [79.4574, 28.3916],
                    [79.4574, 28.3908]
                ]]
        }
    },
    {
        name: "Durga Nagar Mod",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4630, 28.3941],
                    [79.4638, 28.3941],
                    [79.4638, 28.3949],
                    [79.4630, 28.3949],
                    [79.4630, 28.3941]
                ]]
        }
    },
    {
        name: "Gali No 1",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4686, 28.3974],
                    [79.4694, 28.3974],
                    [79.4694, 28.3982],
                    [79.4686, 28.3982],
                    [79.4686, 28.3974]
                ]]
        }
    },
    {
        name: "Shiv Mandir",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4741, 28.4008],
                    [79.4749, 28.4008],
                    [79.4749, 28.4016],
                    [79.4741, 28.4016],
                    [79.4741, 28.4008]
                ]]
        }
    },
    {
        name: "Tulasherpur",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4797, 28.4041],
                    [79.4805, 28.4041],
                    [79.4805, 28.4049],
                    [79.4797, 28.4049],
                    [79.4797, 28.4041]
                ]]
        }
    },
    {
        name: "Bajrang Dhawa",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4852, 28.4074],
                    [79.4860, 28.4074],
                    [79.4860, 28.4082],
                    [79.4852, 28.4082],
                    [79.4852, 28.4074]
                ]]
        }
    },
    {
        name: "Suresh Sharma Nagar",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4908, 28.4108],
                    [79.4916, 28.4108],
                    [79.4916, 28.4116],
                    [79.4908, 28.4116],
                    [79.4908, 28.4108]
                ]]
        }
    },
    {
        name: "Dora Road",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.4963, 28.4141],
                    [79.4971, 28.4141],
                    [79.4971, 28.4149],
                    [79.4963, 28.4149],
                    [79.4963, 28.4141]
                ]]
        }
    },
    {
        name: "University",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5019, 28.4174],
                    [79.5027, 28.4174],
                    [79.5027, 28.4182],
                    [79.5019, 28.4182],
                    [79.5019, 28.4174]
                ]]
        }
    },
    {
        name: "Bisalpur Road",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5074, 28.4208],
                    [79.5082, 28.4208],
                    [79.5082, 28.4216],
                    [79.5074, 28.4216],
                    [79.5074, 28.4208]
                ]]
        }
    },
    {
        name: "Satterlite",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5130, 28.4241],
                    [79.5138, 28.4241],
                    [79.5138, 28.4249],
                    [79.5130, 28.4249],
                    [79.5130, 28.4241]
                ]]
        }
    },
    {
        name: "Gaurd Dwar",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5185, 28.4274],
                    [79.5193, 28.4274],
                    [79.5193, 28.4282],
                    [79.5185, 28.4282],
                    [79.5185, 28.4274]
                ]]
        }
    },
    {
        name: "Nakatiya",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5241, 28.4308],
                    [79.5249, 28.4308],
                    [79.5249, 28.4316],
                    [79.5241, 28.4316],
                    [79.5241, 28.4308]
                ]]
        }
    },
    {
        name: "International City",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5296, 28.4341],
                    [79.5304, 28.4341],
                    [79.5304, 28.4349],
                    [79.5296, 28.4349],
                    [79.5296, 28.4341]
                ]]
        }
    },
    {
        name: "Nariyawal",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5352, 28.4374],
                    [79.5360, 28.4374],
                    [79.5360, 28.4382],
                    [79.5352, 28.4382],
                    [79.5352, 28.4374]
                ]]
        }
    },
    {
        name: "Transport Nagar",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5408, 28.4408],
                    [79.5416, 28.4408],
                    [79.5416, 28.4416],
                    [79.5408, 28.4416],
                    [79.5408, 28.4408]
                ]]
        }
    },
    {
        name: "Invertis University",
        locationArea: {
            type: "Polygon",
            coordinates: [[
                    [79.5463, 28.4441],
                    [79.5471, 28.4441],
                    [79.5471, 28.4449],
                    [79.5463, 28.4449],
                    [79.5463, 28.4441]
                ]]
        }
    }
];
const seedStops = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Clear existing stops
        await Stop_1.default.deleteMany({});
        console.log('🗑️ Cleared existing stops');
        // Insert new stops
        const stops = await Stop_1.default.insertMany(stopsData.map(stop => ({
            ...stop,
            status: 'RED',
            lastUpdated: new Date()
        })));
        console.log(`✅ Created ${stops.length} stops with polygons`);
        // Create 2dsphere index
        const db = mongoose_1.default.connection.db;
        if (db) {
            await db.collection('stops').createIndex({ locationArea: '2dsphere' });
            console.log('✅ 2dsphere index created');
        }
        console.log('\n🎉 Stops seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding stops:', error);
        process.exit(1);
    }
};
seedStops();
