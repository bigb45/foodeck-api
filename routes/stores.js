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

storeRouter.get("/custom_meal", (req, res) => {
  // TODO: get custom meal from database
  return res.status(200).json({
    sections: [
      {
        id: "1",
        type: "radio",
        title: "Pizza Size",
        options: [
          { id: "1", option: "Large", price: 12.0 },
          { id: "2", option: "Medium", price: 10.0 },
          { id: "3", option: "Small", price: 9 },
        ],
        required: true,
        currency: "$",
      },
      {
        id: "2",
        type: "radio",
        title: "Drink Size",
        options: [
          { id: "1", option: "Large", price: 12.0 },
          { id: "2", option: "Medium", price: 10.0 },
          { id: "3", option: "Small", price: 9 },
        ],
        required: true,
        currency: "$",
      },
      {
        id: "3",
        type: "radio",
        title: "Fries Size",
        options: [
          { id: "1", option: "Large", price: 12.0 },
          { id: "2", option: "Medium", price: 10.0 },
          { id: "3", option: "Small", price: 9 },
        ],
        required: true,
        currency: "$",
      },
      {
        id: "4",
        type: "radio",
        title: "Pizza Size1",
        options: [
          { id: "4", option: "Large", price: 12.0 },
          { id: "5", option: "Medium", price: 10.0 },
          { id: "6", option: "Small", price: 9 },
        ],
        required: true,
        currency: "$",
      },
      {
        id: "5",
        type: "checkbox",
        title: "Extra Toppings",
        options: [
          { id: "10", option: "Extra cheese", price: 5.0 },
          { id: "11", option: "Pepperoni", price: 5.0 },
          { id: "12", option: "Margarita", price: 4.75 },
        ],
        required: false,
        currency: "$",
      },
      {
        id: "6",
        type: "checkbox",
        title: "Extra Toppings",
        options: [
          { id: "7", option: "Extra cheese", price: 5.0 },
          { id: "8", option: "Pepperoni", price: 5.0 },
          { id: "9", option: "Margarita", price: 4.75 },
        ],
        required: false,
        currency: "$",
      },
    ],
  });
});

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
