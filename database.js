import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");
});

connection.query(
  "CREATE TABLE IF NOT EXISTS users (id varchar(255) primary key, username varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, password varchar(255))",
  function (err, result) {
    if (err) {
      throw err;
    }
  }
);

export default connection;
