"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const stores_1 = __importDefault(require("./routes/mainRoute/stores"));
const users_1 = __importDefault(require("./routes/mainRoute/users"));
const port = 3000;
const app = (0, express_1.default)();
dotenv_1.default.config();
app.get("/", (req, res) => {
    res.send("home");
});
app.use("/users", users_1.default);
app.use("/stores", stores_1.default);
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port https://0.0.0.0:${port}`);
});
