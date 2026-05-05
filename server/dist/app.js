"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const announcement_routes_1 = __importDefault(require("./routes/announcement.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const app = (0, express_1.default)();
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173'
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/announcements', announcement_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('*', (_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});
exports.default = app;
