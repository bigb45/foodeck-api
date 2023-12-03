import connection from "./database.js";
import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import fs from "fs";

// configure mailing service

const app = express();
app.use(express.json());
const port = 4000;
let refreshTokens = [];

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.CONFIRMATION_SERVICE_EMAIL,
    pass: process.env.CONFIRMATION_SERVICE_PASSWORD,
  },
});

const handlebarsOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: "./views/partials",
    layoutsDir: "./views/layouts",
    defaultLayout: "", // keeping this empty prevents hbs from always using the default layout
  },
  viewPath: "./views",
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarsOptions));

app.post("/create_account", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const emailAlreadyInUse =
    (await getUserByColumn(email, "email")).length !== 0;

  if (emailAlreadyInUse) {
    console.log("a user with that email already exists");
    return res.status(403).send("A user with that email already exists");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    connection.query(
      `insert into users (name, email, password) values ("${name}", "${email}", "${hashedPassword}");`,

      (err, result) => {
        if (err) {
          console.log("Error while inserting user data");
        }
        const accessToken = generateAccessToken(email);
        const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        confirmUser(email);
        return res
          .status(201)
          .send({ accessToken: accessToken, refreshToken: refreshToken });
      }
    );
  }
});

async function confirmUser(userEmail) {
  jwt.sign(
    { email: userEmail },
    process.env.EMAIL_CONFIRMATION_SECRET,
    {
      expiresIn: "2h",
    },
    (err, token) => {
      const url = `http://192.168.1.105:3000/users/confirm/${token}`;
      try {
        sendMail(url, userEmail);
      } catch {
        console.log("could not send email");
      }
    }
  );
}

function sendMail(url, email) {
  transporter.sendMail({
    from: '"Mohammed Natour 🔥🌮" <bgd4500@gmail.com>', // sender address
    to: email, // TODO: replace with user email
    subject: "Confirm your email ✅", // Subject line
    text: "is this thing on?",
    template: "confirm_email_template",
    context: {
      confirmationLink: url,
    },
  });
}

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

function getUserByColumn(name, columnName) {
  return new Promise((resolve, reject) => {
    connection.query(
      `select * from users where ${columnName} = "${name}";`,
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
