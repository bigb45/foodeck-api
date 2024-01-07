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
  "CREATE TABLE IF NOT EXISTS users (id varchar(255) primary key, username varchar(255) NOT NULL, email varchar(255) UNIQUE NOT NULL, password varchar(255));",
  function (err, result) {
    if (err) {
      console.log(err);
    }
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS Stores (store_id varchar(255) primary key, store_name varchar(255) NOT NULL, address varchar(255) NOT NULL, delivery_time Integer NOT NULL, phone varchar(255) NOT NULL, cover_image_url varchar(255), rating FLOAT NOT NULL default 0.0);",
  function (err, result) {
    if (err) {
      console.log(err);
    }
  }
);

connection.query(
  "CREATE TABLE IF NOT EXISTS Offers (offer_id varchar(255) primary key, offer_name varchar(255) NOT NULL,  cover_image_url varchar(255));",
  function (err, result) {
    if (err) {
      console.log(err);
    }
  }
);

export default connection;
