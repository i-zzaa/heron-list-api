"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const senha = bcryptjs_1.default.hashSync('12345678', 8);
    await ['Developer', 'Administrador', 'Atendente'].map(async (perfil, index) => {
        await prisma.perfil.upsert({
            where: { id: index },
            update: {},
            create: {
                nome: perfil,
            },
        });
    });
    await [{ nome: 'Andressa Novaes Menezes', login: 'isa.menezes', perfilId: 1, senha: senha }, { nome: 'Samara Balbino Andreuci', login: 'samara.andreuci', perfilId: 2, senha: senha }].map(async (usuario, id) => {
        await prisma.usuario.upsert({
            where: { id: id },
            update: {},
            create: {
                ...usuario
            },
        });
    });
    await ['Av Neuropsico', 'Av Psicodiag', 'Terapia ABA'].map(async (tipoSessao, id) => {
        await prisma.tipoSessao.upsert({
            where: { id: id },
            update: {},
            create: {
                nome: tipoSessao
            },
        });
    });
    await ['Psico', 'Fono', 'TO', 'PsicoPEDAG'].map(async (especialidade, id) => {
        await prisma.especialidade.upsert({
            where: { id: id },
            update: {},
            create: {
                nome: especialidade
            },
        });
    });
    await ['Integral', 'Manhã', 'Tarde'].map(async (periodo, id) => {
        await prisma.periodo.upsert({
            where: { id: id },
            update: {},
            create: {
                nome: periodo
            },
        });
    });
    await ['Urgente', 'Padrão', 'Voltou ABA'].map(async (periodo, id) => {
        await prisma.status.upsert({
            where: { id: id },
            update: {},
            create: {
                nome: periodo
            },
        });
    });
    await ['Unimed', 'Outros', 'Particular'].map(async (periodo, id) => {
        await prisma.convenio.upsert({
            where: { id: id },
            update: {},
            create: {
                nome: periodo
            },
        });
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1);
});
