"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = exports.generateId = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const log = console.log;
function generateId() {
    return (0, uuid_1.v4)();
}
exports.generateId = generateId;
function authenticateJwt(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).send("No token");
    }
    const secretOrPublicKey = process.env.ACCESS_TOKEN_SECRET || "";
    try {
        jsonwebtoken_1.default.verify(token, secretOrPublicKey, (err, user) => {
            if (err) {
                return res.status(403).send("Invalid token");
            }
            req.body = user;
            next();
        });
    }
    catch (exception) {
        log(exception);
        log("Could not verify token");
        res.status(401).send("Could not verify token");
    }
}
exports.authenticateJwt = authenticateJwt;
