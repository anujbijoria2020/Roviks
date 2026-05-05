"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('MongoDB connected');
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT in .env.`);
            return;
        }
        console.error('Server startup error:', error);
    });
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
});
