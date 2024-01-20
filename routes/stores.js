import express from "express";
import connection from "../database.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { authenticateJwt } from "../util/utils.js";
import e from "express";

const log = console.log;

const storeRouter = express.Router();
storeRouter.use(express.json());

// TODO: filter by user location
storeRouter.get(
  "/all",
  /*authenticateJwt,*/ async (req, res) => {
    try {
      const restaurants = await getRestaurants();
      return res.status(200).json(restaurants);
    } catch (exception) {
      console.log(exception);
      return res.status(500).send("Error: " + exception);
    }
  }
);

storeRouter.get(
  "/offers",
  /* authenticateJwt, */ async (req, res) => {
    try {
      const offers = await getOffers();
      return res.status(200).json(offers);
    } catch (exception) {
      console.log(exception);
      return res.status(500).send("Error: " + exception);
    }
  }
);

storeRouter.get("/bento_categories");

storeRouter.get("/:id", authenticateJwt, (req, res) => {
  return res.status(200).send({ id: req.params.id });
});

async function getOffers() {
  return new Promise((resolve, reject) => {
    connection.query(`select * from Offers;`, async (err, result) => {
      if (err) {
        log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
async function getRestaurants() {
  return new Promise((resolve, reject) => {
    connection.query(`select * from Stores;`, async (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export default storeRouter;
