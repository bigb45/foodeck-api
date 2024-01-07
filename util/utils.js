import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
const log = console.log;

function generateId() {
  return uuidv4();
}

function authenticateJwt(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).send("No token");
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid token");
      }
      req.user = user;
      next();
    });
  } catch (exception) {
    log(exception);
    log("Could not verify token");
    res.status(401).send("Could not verify token");
  }
}

export { generateId, authenticateJwt };
