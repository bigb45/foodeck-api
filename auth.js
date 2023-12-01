import connection from "./database.js";
import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
const port = 4000;

app.post("/create_account", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  connection.query(
    `insert into users (name, email, password) values ("${req.body.name}", "${req.body.email}", "${hashedPassword}");`,

    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err.message);
      }
      const accessToken = jwt.sign(
        req.body.email,
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(201).send(accessToken);
    }
  );
});

let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) {
    return res.status(401).send("No token");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send("Unauthorized token");
  }
  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(403).send("Verification error");
        }
        const accessToken = generateAccessToken(result.email);
        console.log(accessToken);
        res.json({ accessToken: accessToken });
      }
    );
  } catch (e) {
    res.status(401).send("Unknown error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const result = await getUserByEmail(req.body.email);

    // check if user exists
    if (result.length === 0) {
      return res.status(500).send("Unregistered account");
    }

    // check password
    const isPasswordCorrect = await comparePassword(
      req.body.password,
      result[0].password
    );

    if (isPasswordCorrect) {
      console.log("user is logged on");
      // create jwt
      const accessToken = generateAccessToken(result[0]);
      const refreshToken = jwt.sign(
        result[0],
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log(jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET));

      refreshTokens.push(refreshToken);

      return res
        .status(203)
        .send({ accessToken: accessToken, refreshToken: refreshToken });
    } else {
      return res.status(403).send("Wrong password or email");
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

function generateAccessToken(key) {
  return jwt.sign({ email: key }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
}

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    connection.query(
      `select * from users where email = "${email}";`,
      async (err, result) => {
        if (err) {
          console.log(err);
          reject("error while fetching data");
        } else {
          resolve(result);
        }
      }
    );
  });
}

function comparePassword(inputPassword, hashedPassword) {
  return new Promise((resolve, reject) =>
    bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    })
  );
}

app.listen(port, "0.0.0.0", () => {
  console.log(`auth server is running on port https://0.0.0.0:${port}`);
});
