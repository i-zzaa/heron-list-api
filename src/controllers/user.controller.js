"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("../services/user.service");
const message_response_1 = require("../utils/message.response");
class userController {
    static create = async (req, res, next) => {
        try {
            const body = req.body;
            body.ativo = true;
            const data = await (0, user_service_1.createUser)(req.body);
            res.status(200).json((0, message_response_1.messageSuccess)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static getTerapeuta = async (req, res, next) => {
        try {
            const response = await (0, user_service_1.getTerapeuta)();
            res.status(200).json((0, message_response_1.messageSuccessList)(response));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static update = async (req, res, next) => {
        try {
            const data = await (0, user_service_1.updateUser)(req.body);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static updatePassword = async (req, res, next) => {
        try {
            const data = await (0, user_service_1.updatePassword)(req.params.id);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static updatePasswordLogin = async (req, res, next) => {
        try {
            const data = await (0, user_service_1.updatePasswordLogin)(req.params.login, req.body);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static get = async (req, res, next) => {
        try {
            const data = await (0, user_service_1.getUsers)();
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static search = async (req, res, next) => {
        try {
            const data = await (0, user_service_1.searchUsers)(req.params.search);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
}
exports.userController = userController;
