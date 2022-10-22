"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agendaController = void 0;
const agenda_service_1 = require("../services/agenda.service");
const message_response_1 = require("../utils/message.response");
class agendaController {
    static create = async (req, res, next) => {
        try {
            const body = req.body;
            body.ativo = true;
            const data = await (0, agenda_service_1.createAgenda)(req.body);
            res.status(200).json((0, message_response_1.messageSuccess)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static getMes = async (req, res, next) => {
        try {
            const response = await (0, agenda_service_1.getMes)(req.params.current);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static getDia = async (req, res, next) => {
        try {
            const data = await (0, agenda_service_1.getDia)(req.params.current);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static update = async (req, res, next) => {
        try {
            const data = await (0, agenda_service_1.updateAgenda)(req.params.id);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
}
exports.agendaController = agendaController;
