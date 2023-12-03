import express from "express";
import connection from "../database.js";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(express.json());
router.get("/", (req, res) => {
  res.send("you're on the users page");
});

router.get("/all", authenticateJwt, (req, res) => {
  connection.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send({ NumberOfUsers: result.length, users: result });
  });
});

router.get("/:id", authenticateJwt, (req, res) => {
  connection.query(
    `select * from users where id = ${req.params.id}`,
    (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      } else {
        res.send(result[0]);
      }
    }
  );
});

router.get("/confirm/:token", (req, res) => {
  try {
    jwt.verify(
      req.params.token,
      process.env.EMAIL_CONFIRMATION_SECRET,

      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(403).send("Confirmation link is invalid");
        }
        console.log(result);
        // TODO: set the confirmedUser column value to "true" for this user. use "result.email" to access user email
        return res.status(200).send("Your email is now confirmed");
      }
    );
  } catch {
    console.log("could not verify confirmation token");
  }
});

router.delete("/:id", authenticateJwt, (req, res) => {
  const userId = req.params.id;

  connection.query(`delete from users where id = ${userId}`, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    res.send(result);
  });
});

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
  } catch {
    console.log("Could not verify token");
    res.status(401).send("Could not verify token");
  }
}

export default router;
