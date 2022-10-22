"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const http_errors_1 = require("http-errors");
const accessTokenSecret = 'multialcance';
function signAccessToken(payload) {
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.sign)({ payload }, accessTokenSecret, {}, (err, token) => {
            if (err) {
                reject(new http_errors_1.InternalServerError());
            }
            resolve(token);
        });
    });
}
exports.signAccessToken = signAccessToken;
function verifyAccessToken(token) {
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.verify)(token, accessTokenSecret, (err, payload) => {
            if (err) {
                const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message;
                return reject(new http_errors_1.Unauthorized(message));
            }
            resolve(payload);
        });
    });
}
exports.verifyAccessToken = verifyAccessToken;
