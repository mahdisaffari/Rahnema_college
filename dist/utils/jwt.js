"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAccessToken(user) {
    const payload = { sub: user.id, username: user.username, email: user.email };
    const options = { expiresIn: env_1.JWT_EXPIRES };
    return jsonwebtoken_1.default.sign(payload, env_1.JWT_SECRET, options);
}
