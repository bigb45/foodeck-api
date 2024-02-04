"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const middleware_1 = require("../../middleware/middleware");
const mutlerConfig_1 = require("../../config/mutlerConfig");
const log = console.log;
const usersRouter = express_1.default.Router();
usersRouter.use(express_1.default.json());
usersRouter.get("/", (req, res) => {
    res.send("you're on the users page");
});
usersRouter.get("/all", middleware_1.authenticateJwt, (req, res) => {
    // connection.query("SELECT * FROM users", (err, result) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    //   res.send({ NumberOfUsers: result.length, users: result });
    // });
});
usersRouter.get("/:id", middleware_1.authenticateJwt, (req, res) => {
    log(req.body, req.headers);
    // connection.query(
    //   `select id, username, email from users where id = "${req.params.id}"`,
    //   (err, result) => {
    //     if (err) {
    //       log(err.message);
    //       return res.status(404).send({ error: err.message });
    //     }
    //     if (result.length === 0) {
    //       log("user not found");
    //       res.status(404).send({ error: "user not found" });
    //       return;
    //     } else {
    //       console.log(result[0]);
    //       res.send({
    //         userId: result[0].id.toString(),
    //         name: result[0].username,
    //         email: result[0].email,
    //       });
    //     }
    //   }
    // );
});
usersRouter.get("/confirm/:token", (req, res) => {
    const secretOrPublicKey = process.env.ACCESS_TOKEN_SECRET || "";
    try {
        jsonwebtoken_1.default.verify(req.params.token, secretOrPublicKey, (err, result) => {
            if (err) {
                log(err);
                return res.status(403).send("Confirmation link is invalid");
            }
            log(result);
            // TODO: set the confirmedUser column value to "true" for this user. use "result.email" to access user email
            return res.status(200).send("Your email is now confirmed");
        });
    }
    catch {
        log("could not verify confirmation token");
    }
});
// TODO: move this to middleware
function uploadFile(req, res, next) {
    mutlerConfig_1.upload.single("file")(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            log("multer error " + err.message);
            return res.status(500).send("A multer error occurred while uploading");
        }
        else if (err) {
            log("error " + err.message);
            return res.status(500).send("An unknown error occurred while uploading");
        }
        next();
    });
}
usersRouter.post("/upload", uploadFile, (req, res) => {
    log("file uploaded");
    return res.status(200).send("uploaded successfully");
});
usersRouter.delete("/:id", middleware_1.authenticateJwt, (req, res) => {
    const userId = req.params.id;
    // connection.query(`delete from users where id = ${userId}`, (err, result) => {
    //   if (err) {
    //     log(err);
    //     return;
    //   }
    //   res.send(result);
    // });
});
exports.default = usersRouter;
