import express from "express";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import storeRouter from "./routes/stores.js";
const port = 3000;

const app = express();
dotenv.config();

app.get("/", (req, res) => {
  res.send("home");
});

app.use("/users", usersRouter);

app.use("/stores", storeRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port https://0.0.0.0:${port}`);
});
