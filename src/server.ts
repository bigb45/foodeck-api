import Express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import storesRouter from "./routes/mainRoute/stores";
import usersRouter from "./routes/mainRoute/users";
const port = 3000;

const app = Express();
dotenv.config();

app.get("/", (req: Request, res: Response) => {
  res.send("home");
});

app.use("/users", usersRouter);

app.use("/stores", storesRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port https://0.0.0.0:${port}`);
});
