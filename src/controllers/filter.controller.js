"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterController = void 0;
const patient_service_1 = require("../services/patient.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class filterController {
    static filter = async (req, res, next) => {
        try {
            let data = [];
            switch (req.params.type) {
                case 'pacientes':
                    data = await (0, patient_service_1.filterSinglePatients)(req.body);
                    break;
            }
            res.status(200).json(data);
        }
        catch (error) {
            res.status(401).json(error);
            next();
        }
    };
    static dropdown = async (req, res, next) => {
        try {
            const type = req.params.type;
            let dropdrown = [];
            switch (type) {
                case 'perfil':
                    dropdrown = await prisma.perfil.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                        where: {
                            NOT: {
                                nome: {
                                    in: ['Developer', 'developer'],
                                },
                            },
                        },
                    });
                    break;
                case 'usuario':
                    dropdrown = await prisma.usuario.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                        where: {
                            NOT: {
                                perfil: {
                                    nome: {
                                        in: ['Developer', 'developer'],
                                    },
                                },
                            },
                        },
                    });
                    break;
                case 'tipo-sessao':
                    dropdrown = await prisma.tipoSessao.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
                case 'status':
                    dropdrown = await prisma.status.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
                case 'especialidade':
                    dropdrown = await prisma.especialidade.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
                case 'periodo':
                    dropdrown = await prisma.periodo.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
                case 'convenio':
                    dropdrown = await prisma.convenio.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
                case 'paciente':
                    dropdrown = await prisma.paciente.findMany({
                        select: {
                            id: true,
                            nome: true,
                        },
                    });
                    break;
            }
            res.status(200).json(dropdrown);
        }
        catch (error) {
            res.status(500).json(error);
            next();
        }
    };
}
exports.filterController = filterController;
