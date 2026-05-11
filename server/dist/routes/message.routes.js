"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route('/').post(auth_middleware_1.verifyToken, message_controller_1.createMessage).get(auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, message_controller_1.getMessages);
exports.default = router;
