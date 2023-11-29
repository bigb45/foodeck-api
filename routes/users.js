import express from "express";
import connection from "../database.js";
import bcrypt, { hash } from "bcrypt";

const router = express.Router();
router.use(express.json());
router.get("/", (req, res) => {
  res.send("you're on the users page");
});

router.get("/all", (req, res) => {
  connection.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send(result);
  });
  // res.send("you're on the users all page");
});

router.get("/:id", (req, res) => {
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

router.post("/create_account", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  connection.query(
    `insert into users (name, email, password) values ("${req.body.name}", "${req.body.email}", "${hashedPassword}");`,

    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500);
        return;
      }
      res.status(201).send(result);
    }
  );
});

router.post("/login", async (req, res) => {
  connection.query(
    `select * from users where email = "${req.body.email}";`,
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error while fetching data");
      }

      if (result.length === 0) {
        return res.status(500).send("Unregistered account");
      }

      // try {
      const passwordResult = bcrypt.compare(
        req.body.password,
        result[0].password,
        (err, pasRes) => {
          if (err) console.log(err);
          if (pasRes) {
            console.log("valid");
          } else {
            console.log("invalid", result[0].password, req.body.password);
          }
        }
      );
      if (passwordResult) {
        res.status(203).send("Success");
      } else {
        res.status(403).send("Password error");
      }
      return;
      // } catch {
      //   console.log("Unknown error occurred");
      //   res.status(500).send("Unknown error");
      // }
    }
  );
});

router.delete("/:id", (req, res) => {
  const userId = req.params.id;

  connection.query(
    `delete from users where id = ${req.params.id}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      res.send(result);
    }
  );
});

export default router;
