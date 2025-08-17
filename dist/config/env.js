"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.JWT_EXPIRES = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "dev_secret_change_me";
exports.JWT_EXPIRES = (_b = process.env.JWT_EXPIRES) !== null && _b !== void 0 ? _b : "15m";
exports.PORT = Number(process.env.PORT || 3000);
