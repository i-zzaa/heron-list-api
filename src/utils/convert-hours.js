"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormat = exports.calculaData = exports.calculaIdade = exports.formatdate = exports.formatadataPadraoBD = void 0;
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('pt-BR');
const formatadataPadraoBD = (date) => {
    const _date = new Date(date);
    return (0, moment_1.default)(_date).format('YYYY-MM-DD');
};
exports.formatadataPadraoBD = formatadataPadraoBD;
const formatdate = (date) => {
    const _date = new Date(date);
    const format = (0, moment_1.default)(_date).add(1, 'days');
    return (0, moment_1.default)(format).format('DD/MM/YYYY');
};
exports.formatdate = formatdate;
const calculaIdade = (dataNascimento) => {
    const idade = (0, moment_1.default)(dataNascimento, 'YYYYMMDD').fromNow();
    return idade.replace('há', '');
};
exports.calculaIdade = calculaIdade;
const calculaData = (data1, data2) => {
    const dataAtual = (0, moment_1.default)(data1);
    const dataPassada = (0, moment_1.default)(data2);
    const diff = moment_1.default.duration(dataAtual.diff(dataPassada));
    return diff.asDays();
};
exports.calculaData = calculaData;
const getFormat = (dias) => {
    if (!dias)
        return 0;
    const mes = Number((moment_1.default.duration(dias).asMonths() + 1).toFixed());
    const anos = Number((moment_1.default.duration(dias).asYears() + 1).toFixed());
    const quebraDias = dias % 30;
    const meses = dias % 365;
    let result = '';
    switch (true) {
        case dias < 30:
            return `${dias} dias`;
        case dias < 365:
            result = `${mes} mes(es)`;
            if (quebraDias !== 0)
                result = `${result} e ${quebraDias} dia(s)`;
            return result;
        case dias >= 365:
            result = `${anos} ano(s)`;
            if (meses !== 0)
                `${result} e ${meses} mes(es)`;
            if (quebraDias !== 0 && meses !== 0)
                result = `${result}, ${meses} mes(es) e ${quebraDias} dia(s)`;
            if (quebraDias !== 0 && mes === 0)
                result = `${result} e ${quebraDias} dia(s)`;
            return result;
    }
};
exports.getFormat = getFormat;
