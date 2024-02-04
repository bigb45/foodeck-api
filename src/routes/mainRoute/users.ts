import express, { NextFunction, Request, Response } from "express";
import jwt, { Secret, GetPublicKeyOrSecret } from "jsonwebtoken";
import multer, { FileFilterCallback } from "multer";
import { authenticateJwt } from "../../middleware/middleware";
import { upload } from "../../config/mutlerConfig";
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const log = console.log;

const usersRouter = express.Router();
usersRouter.use(express.json());

usersRouter.get("/", (req, res) => {
  res.send("you're on the users page");
});

usersRouter.get("/all", authenticateJwt, (req, res) => {
  // connection.query("SELECT * FROM users", (err, result) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   res.send({ NumberOfUsers: result.length, users: result });
  // });
});

usersRouter.get("/:id", authenticateJwt, (req, res) => {
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
  const secretOrPublicKey: Secret | GetPublicKeyOrSecret =
    process.env.ACCESS_TOKEN_SECRET || "";

  try {
    jwt.verify(
      req.params.token,
      secretOrPublicKey,

      (err, result) => {
        if (err) {
          log(err);
          return res.status(403).send("Confirmation link is invalid");
        }
        log(result);
        // TODO: set the confirmedUser column value to "true" for this user. use "result.email" to access user email
        return res.status(200).send("Your email is now confirmed");
      }
    );
  } catch {
    log("could not verify confirmation token");
  }
});

// TODO: move this to middleware
function uploadFile(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      log("multer error " + err.message);
      return res.status(500).send("A multer error occurred while uploading");
    } else if (err) {
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

usersRouter.delete("/:id", authenticateJwt, (req, res) => {
  const userId = req.params.id;

  // connection.query(`delete from users where id = ${userId}`, (err, result) => {
  //   if (err) {
  //     log(err);
  //     return;
  //   }
  //   res.send(result);
  // });
});

export default usersRouter;
