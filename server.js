import express from "express";
import dotenv from "dotenv";
import router from "./routes/users.js";

const port = 3000;

const app = express();
dotenv.config();

app.get("/", (req, res) => {
  res.send("home");
});

app.use("/users", router);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port https://0.0.0.0:${port}`);
});
