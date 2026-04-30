"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("./models/User.model"));
const Category_model_1 = __importDefault(require("./models/Category.model"));
const Settings_model_1 = __importDefault(require("./models/Settings.model"));
const catalogCategories_1 = require("./constants/catalogCategories");
dotenv_1.default.config();
const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI ||
            process.env.MONGODB_URI ||
            'mongodb://127.0.0.1:27017/roviks';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clear existing data
        await User_model_1.default.deleteMany({});
        await Category_model_1.default.deleteMany({});
        await Settings_model_1.default.deleteMany({});
        // Insert admin user
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
        await User_model_1.default.create({
            email: 'admin@roviks.com',
            password: hashedPassword,
            fullName: 'Admin',
            phone: '9999999999',
            whatsappNumber: '919999999999',
            city: 'Indore',
            role: 'admin',
            isApproved: true
        });
        // Insert the canonical catalog categories
        await Category_model_1.default.create(catalogCategories_1.CATALOG_CATEGORY_DEFINITIONS.map((definition) => ({
            name: definition.name,
            slug: definition.slug,
            kind: definition.kind,
            sortOrder: definition.sortOrder,
        })));
        // Insert settings record
        await Settings_model_1.default.create({
            key: 'whatsappNumber',
            value: '919999999999'
        });
        console.log("Seeding complete");
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};
seedDB();
