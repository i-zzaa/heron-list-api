"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const message_response_1 = require("../utils/message.response");
class authController {
    static login = async (req, res, next) => {
        try {
            const data = await (0, auth_service_1.loginService)(req.body);
            res.status(200).json((0, message_response_1.messageSuccessLogin)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
}
exports.authController = authController;
