"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vagaController = void 0;
const vaga_service_1 = require("../services/vaga.service");
const message_response_1 = require("../utils/message.response");
class vagaController {
    static update = async (req, res, next) => {
        try {
            const data = await (0, vaga_service_1.updateVaga)(req.body);
            const message = {
                data: data ? 'Paciente ainda na fila' : 'Paciente saiu da fila',
            };
            res.status(200).json((0, message_response_1.messageUpdate)(message));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static dashboard = async (req, res, next) => {
        try {
            let data;
            switch (req.params.type) {
                case 'tipoSessoes':
                    data = await (0, vaga_service_1.tipoSessoesVaga)();
                    break;
                case 'especialidades':
                    data = await (0, vaga_service_1.especialidadesVaga)();
                    break;
                case 'status':
                    data = await (0, vaga_service_1.statusVaga)();
                    break;
            }
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static wait = async (req, res, next) => {
        try {
            const data = await (0, vaga_service_1.esperaVaga)();
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static returnTrend = async (req, res, next) => {
        try {
            const data = await (0, vaga_service_1.returnVaga)();
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static updateReturn = async (req, res, next) => {
        try {
            const data = await (0, vaga_service_1.updateReturn)(req.body);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
}
exports.vagaController = vagaController;
