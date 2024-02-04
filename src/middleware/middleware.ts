import { v4 as uuidv4 } from "uuid";
import jwt, { Secret, GetPublicKeyOrSecret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
const log = console.log;

function generateId() {
  return uuidv4();
}

function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).send("No token");
  }

  const secretOrPublicKey: Secret | GetPublicKeyOrSecret =
    process.env.ACCESS_TOKEN_SECRET || "";

  try {
    jwt.verify(token, secretOrPublicKey, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid token");
      }
      req.body = user;
      next();
    });
  } catch (exception) {
    log(exception);
    log("Could not verify token");
    res.status(401).send("Could not verify token");
  }
}

export { generateId, authenticateJwt };
