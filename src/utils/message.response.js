"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageDelete = exports.messageUpdate = exports.messageSuccess = exports.messageSuccessList = exports.messageSuccessLogin = exports.messageErrorLogin = exports.ERROR_DELETE = exports.ERROR_CREATE = exports.DELETE_UPDATE = exports.SUCCESS_UPDATE = exports.SUCCESS_CREATE = exports.ERROR_NOT_ACTIVE = exports.ERROR_NOT_FOUND_USER = exports.ERROR_LOGIN_PASSWORD = void 0;
exports.ERROR_LOGIN_PASSWORD = 'Login e/ou senha inválido(a)!';
exports.ERROR_NOT_FOUND_USER = 'Usuário não cadastrado!';
exports.ERROR_NOT_ACTIVE = 'Usuário não está ativo!';
exports.SUCCESS_CREATE = 'Criado com sucesso!';
exports.SUCCESS_UPDATE = 'Atualizado com sucesso!';
exports.DELETE_UPDATE = 'Excluido com sucesso!';
exports.ERROR_CREATE = 'Erro na criação!';
exports.ERROR_DELETE = 'Erro na exclusão!';
const messageErrorLogin = () => ({
    status: false,
    message: exports.ERROR_LOGIN_PASSWORD,
});
exports.messageErrorLogin = messageErrorLogin;
const messageSuccessLogin = (data) => ({
    message: 'Logado!',
    ...data,
});
exports.messageSuccessLogin = messageSuccessLogin;
const messageSuccessList = (data) => (data);
exports.messageSuccessList = messageSuccessList;
const messageSuccess = (data) => ({
    message: exports.SUCCESS_CREATE,
    ...data,
});
exports.messageSuccess = messageSuccess;
const messageUpdate = (data) => ({
    message: exports.SUCCESS_UPDATE,
    ...data,
});
exports.messageUpdate = messageUpdate;
const messageDelete = (data) => ({
    message: exports.SUCCESS_UPDATE,
    ...data,
});
exports.messageDelete = messageDelete;
