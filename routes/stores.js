import express from "express";
import { connection } from "../db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { authenticateJwt } from "../util/utils.js";
import { Prisma } from "@prisma/client";

const log = console.log;

const storeRouter = express.Router();
storeRouter.use(express.json());

// TODO: filter by user location
storeRouter.get(
  "/all",
  /*authenticateJwt,*/ async (req, res) => {
    try {
      const result = await connection.Store.findMany({
        orderBy: { rating: "desc" },
      });
      res.status(200).json(result);
    } catch (e) {
      log(e);
      return res.status(500).send("Error: " + e);
    }
  }
);

storeRouter.get(
  // get all menus of a store by store id
  "/:store_id/menu/all",
  async (req, res) => {
    try {
      const sections = await connection.StoreSection.findMany({
        where: {
          store_id: req.params.store_id,
        },

        select: {
          section_id: true,
          section_title: true,

          StoreItem: {
            select: {
              item_id: true,
              item_name: true,
              description: true,
              price: true,
              cover_image_url: true,
            },
            where: {
              store_item_section_id: {
                equals: connection.StoreSection.section_id,
              },
              store_id: {
                equals: req.params.store_id,
              },
            },
          },
        },
      });

      res.status(200).json(sections);
    } catch (e) {
      log(e);
      return res.status(500).json({ Error: e });
    }
  }
);

storeRouter.get(
  // get store menu by id, returns menu info, isMenuFavorite, menu customization options
  "/:store_id/menu/:menu_id",
  async (req, res) => {
    try {
      const menu = await connection.StoreItem.findUnique({
        where: {
          item_id: req.params.menu_id,
          store: { store_id: { equals: req.params.store_id } },
        },
      });
      res.status(200).json(menu);
    } catch (e) {
      log(e);
      return res.status(500).send("Error: " + e);
    }
  }
);
storeRouter.get(
  "/offers",
  /* authenticateJwt, */ async (req, res) => {
    try {
      const offers = await connection.Offer.findMany();
      return res.status(200).json(offers);
    } catch (exception) {
      console.log(exception);
      return res.status(500).send("Error: " + exception);
    }
  }
);

// TODO: get data from database
storeRouter.get("/bento_categories/:id", async (req, res) => {
  let users = await connection.User.findUnique({
    where: { id: req.params.id },
  });
  res.status(200).json(users);
});

storeRouter.get("/:store_id/:menu_id/options", async (req, res) => {
  try {
    const menuOptions = await connection.OptionSection.findMany({
      where: {
        store_item_id: req.params.menu_id,
      },
      select: {
        section_id: true,
        sectionType: true,
        section_name: true,
        Option: {
          select: {
            option_id: true,
            option_name: true,
            price: true,
          },
        },
        required: true,
      },
    });
    return res.status(200).json({ sections: menuOptions });
  } catch (e) {
    log(e.message);
    return res.status(500).send("Error: " + e.message);
  }

  // return res.status(200).json({
  //   sections: [
  //     {
  //       id: "1",
  //       type: "radio",
  //       title: "Pizza Size",
  //       options: [
  //         { id: "1", option: "Large", price: 12.0 },
  //         { id: "2", option: "Medium", price: 10.0 },
  //         { id: "3", option: "Small", price: 9 },
  //       ],
  //       required: true,
  //       currency: "$",
  //     },
  //     {
  //       id: "2",
  //       type: "radio",
  //       title: "Drink Size",
  //       options: [
  //         { id: "1", option: "Large", price: 12.0 },
  //         { id: "2", option: "Medium", price: 10.0 },
  //         { id: "3", option: "Small", price: 9 },
  //       ],
  //       required: true,
  //       currency: "$",
  //     },
  //     {
  //       id: "3",
  //       type: "radio",
  //       title: "Fries Size",
  //       options: [
  //         { id: "1", option: "Large", price: 12.0 },
  //         { id: "2", option: "Medium", price: 10.0 },
  //         { id: "3", option: "Small", price: 9 },
  //       ],
  //       required: true,
  //       currency: "$",
  //     },
  //     {
  //       id: "4",
  //       type: "radio",
  //       title: "Pizza Size1",
  //       options: [
  //         { id: "4", option: "Large", price: 12.0 },
  //         { id: "5", option: "Medium", price: 10.0 },
  //         { id: "6", option: "Small", price: 9 },
  //       ],
  //       required: true,
  //       currency: "$",
  //     },
  //     {
  //       id: "5",
  //       type: "checkbox",
  //       title: "Extra Toppings",
  //       options: [
  //         { id: "10", option: "Extra cheese", price: 5.0 },
  //         { id: "11", option: "Pepperoni", price: 5.0 },
  //         { id: "12", option: "Margarita", price: 4.75 },
  //       ],
  //       required: false,
  //       currency: "$",
  //     },
  //     {
  //       id: "6",
  //       type: "checkbox",
  //       title: "Extra Toppings",
  //       options: [
  //         { id: "7", option: "Extra cheese", price: 5.0 },
  //         { id: "8", option: "Pepperoni", price: 5.0 },
  //         { id: "9", option: "Margarita", price: 4.75 },
  //       ],
  //       required: false,
  //       currency: "$",
  //     },
  //   ],
  // });
});

storeRouter.get(
  "/:id",
  /* authenticateJwt,*/ (req, res) => {
    return res.status(200).send({ id: req.params.id });
  }
);

export default storeRouter;
