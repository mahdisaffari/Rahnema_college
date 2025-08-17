"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes/routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });
app.use("/", routes_1.default);
app.listen(env_1.PORT, () => console.log(`Server started at http://localhost:${env_1.PORT}`));
