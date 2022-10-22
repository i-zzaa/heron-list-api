"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = void 0;
const patient_service_1 = require("../services/patient.service");
const message_response_1 = require("../utils/message.response");
class patientController {
    static create = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.createPatient)(req.body);
            res.status(200).json((0, message_response_1.messageSuccess)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static update = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.updatePatient)(req.body);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static disabled = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.updateDisabled)(req.body);
            res.status(200).json((0, message_response_1.messageUpdate)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static deleteItem = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.deletePatient)(req.params.id);
            res.status(200).json((0, message_response_1.messageDelete)(data));
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static get = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.getPatients)();
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static search = async (req, res, next) => {
        try {
            const data = await (0, patient_service_1.searchPatients)(req.params.search);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
}
exports.patientController = patientController;
