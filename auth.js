import connection from "./database.js";
import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { OAuth2Client } from "google-auth-library";
import { verify } from "crypto";
import { v4 as uuidv4 } from "uuid";
import FB from "fb";
const log = console.log;
// configure mailing service

const baseUrl = process.env.BASE_URL || "192.168.1.104";
const app = express();
app.use(express.json());
const port = 4000;
let refreshTokens = [];
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// ENDPOINTS

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
    const userId = generateId();
    connection.query(
      `insert into users (id, username, email, password) values ("${userId}", "${name}", "${email}", "${hashedPassword}");`,

      async (err, result) => {
        if (err) {
          console.log("Error while inserting user data" + err);
          return res.status(500).send("Error while inserting user data" + err);
        }

        let user = await getUserByColumn(email, "email");
        log("user is: " + user[0].id);
        const accessToken = generateAccessToken(email);
        const refreshToken = generateRefreshToken(email);
        refreshTokens.push(refreshToken);
        // confirmUser(email);
        return res.status(201).send({
          userId: user[0].id,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      }
    );
  }
});

async function createNewUser(email, name) {
  const userId = generateId();
  const test = "password1";
  connection.query(
    `insert into users (id, username, email) values ("${userId}", "${name}", "${email}");`,

    async (err, result) => {
      if (err) {
        console.log("Error while inserting user data" + err);
        throw err;
      }
      log("created new user with email " + email);
      return userId;
    }
  );
}

async function confirmUser(userEmail) {
  jwt.sign(
    { email: userEmail },
    process.env.EMAIL_CONFIRMATION_SECRET,
    {
      expiresIn: "2h",
    },
    (err, token) => {
      const url = `http://${baseUrl}:3000/users/confirm/${token}`;
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
    return res.status(401).send("Unauthorized token");
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

app.delete("/logout", (req, res) => {
  // TODO: delete refresh token from db
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login_with_token/:provider", async (req, res) => {
  log("received token");
  const provider = req.params.provider;
  const token = req.body.token;
  let userInfo = {};
  if (provider === "google") {
    userInfo = await verifyGoogleIdToken(token);
    userInfo = {
      userId: userInfo.userId,
      username: userInfo.username,
      userEmail: userInfo.userEmail,
    };
  } else if (provider === "facebook") {
    FB.setAccessToken(token);
    userInfo = await getFacebookUserInfo();
    userInfo = {
      userId: userInfo.id,
      username: userInfo.name,
      userEmail: userInfo.email,
    };
  }
  try {
    let userId = "";
    getUserByColumn(userInfo.userEmail, "email").then((result) => {
      if (result.length !== 0) {
        // if the email already exists, do not create a new user
        userId = result[0].id;
        log("user exists");
      } else {
        // if the email does not exist, create a new user
        log("user does not exist");
        try {
          userId = createNewUser(userInfo.userEmail, userInfo.username);
        } catch (e) {
          log(e);
          return res.status(500).send({ message: `${e.message}` });
        }
      }
      const accessToken = generateAccessToken(userInfo.userEmail);
      const refreshToken = generateRefreshToken(userInfo.userEmail);
      return res.status(201).send({
        // TODO: change this to the generated id from the database
        userId: userId,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    });
  } catch (e) {
    log("Error while authenticating with token: " + e);
    req.res.status(500).send({ message: `Error: ${e.message}` });
  }
});

app.post("/login", async (req, res) => {
  try {
    const result = await getUserByEmail(req.body.email);

    if (result.length === 0) {
      return res.status(404).send({ error: "user not found" });
    }

    const isPasswordCorrect = await comparePassword(
      req.body.password,
      result[0].password
    );
    if (isPasswordCorrect) {
      console.log("user is logged on");

      const accessToken = generateAccessToken(result[0]);
      const refreshToken = jwt.sign(
        result[0],
        process.env.REFRESH_TOKEN_SECRET
      );

      refreshTokens.push(refreshToken);
      let userId = await getUserByColumn(req.body.email, "email");
      log("user is: " + userId[0].id);
      return res.status(203).send({
        userId: userId[0].id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      return res.status(403).send("Wrong password or email");
    }
  } catch (e) {
    log(e);
    res.status(500).send(e);
  }
});

function generateAccessToken(key) {
  return jwt.sign({ email: key }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3m",
  });
}

function generateRefreshToken(key) {
  return jwt.sign(key, process.env.REFRESH_TOKEN_SECRET);
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

function generateId() {
  return uuidv4();
}

function getFacebookUserInfo() {
  return new Promise((resolve, reject) => {
    FB.api("/me", "GET", { fields: "id,name,email" }, function (response) {
      if (response && !response.error) {
        resolve(response);
      } else {
        reject(response ? response.error : new Error("Unknown error"));
      }
    });
  });
}

async function verifyGoogleIdToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;
    const username = payload.name;
    const userEmail = payload.email;

    return { userId, username, userEmail };
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    throw new Error("Invalid Google ID token");
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`auth server is running on port https://0.0.0.0:${port}`);
});
