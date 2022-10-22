"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convenioController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const convenio_service_1 = require("../services/convenio.service");
class convenioController {
    static create = async (req, res, next) => {
        try {
            const body = req.body;
            body.ativo = true;
            const data = await (0, convenio_service_1.createConvenio)(req.body);
            res.status(200).json({
                status: true,
                message: 'Criado com sucesso!',
                data,
            });
        }
        catch (error) {
            next((0, http_errors_1.default)(error.statusCode, error.message));
        }
    };
    static update = async (req, res, next) => {
        try {
            const data = await (0, convenio_service_1.updateConvenio)(req.body, req.params.id);
            res.status(200).json({
                status: true,
                message: 'Atualizado com sucesso!',
                data,
            });
        }
        catch (error) {
            next((0, http_errors_1.default)(error.statusCode, error.message));
        }
    };
    static get = async (req, res, next) => {
        try {
            const data = await (0, convenio_service_1.getConvenio)();
            res.status(200).json({
                status: true,
                message: 'Sucesso!',
                data,
            });
        }
        catch (error) {
            next((0, http_errors_1.default)(error.statusCode, error.message));
        }
    };
    static search = async (req, res, next) => {
        try {
            const data = await (0, convenio_service_1.searchConvenio)(req.params.search);
            res.status(200).json({
                status: true,
                message: 'Sucesso!',
                data,
            });
        }
        catch (error) {
            next((0, http_errors_1.default)(error.statusCode, error.message));
        }
    };
}
exports.convenioController = convenioController;
