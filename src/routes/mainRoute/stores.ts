import express, { Request, Response } from "express";
import { connection } from "../../../db";
import { authenticateJwt } from "../../middleware/middleware.js";

const log = console.log;

const storeRouter = express.Router();
storeRouter.use(express.json());

// TODO: filter by user location
storeRouter.get(
  "/all",
  /*authenticateJwt,*/ async (req, res) => {
    try {
      const result = await connection.store.findMany({
        orderBy: { rating: "desc" },
      });
      res.status(200).json(result);
    } catch (e) {
      log(e);
      return res.status(500).send("Error: " + e);
    }
  }
);

storeRouter.get("/bento_categories", async (req: Request, res: Response) => {
  res.status(200).json([
    {
      id: 1,
      name: "Desserts",
      subText: "Get your sweet tooth fix with these delicious desserts",
    },
    {
      id: 2,
      name: "Ramen",
      subText: "Authentic Asian Ramen, made with love",
    },
    {
      id: 3,
      name: "Snacks",
      subText: "Delicious snacks to keep you going",
    },
  ]);
});

storeRouter.get(
  // get all menus of a store by store id
  "/:store_id/menu/all",
  async (req, res) => {
    try {
      const sections = await connection.storeSection.findMany({
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
      const menu = await connection.storeItem.findUnique({
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
      const offers = await connection.offer.findMany();
      return res.status(200).json(offers);
    } catch (exception) {
      console.log(exception);
      return res.status(500).send("Error: " + exception);
    }
  }
);

// TODO: get data from database
storeRouter.get("/bento_categories/:id", async (req, res) => {
  let users = await connection.user.findUnique({
    where: { id: req.params.id },
  });
  res.status(200).json(users);
});

storeRouter.get("/:store_id/:menu_id/options", async (req, res) => {
  try {
    const menuOptions = await connection.optionSection.findMany({
      where: {
        store_item_id: req.params.menu_id,
      },
      select: {
        section_id: true,
        sectionType: true,
        section_name: true,
        Option: {
          orderBy: {
            price: "asc",
          },
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
  } catch (e: any) {
    log(e.message);
    return res.status(500).send("Error: " + e.message);
  }
});

storeRouter.get(
  "/:id",
  /* authenticateJwt,*/ (req, res) => {
    return res.status(200).send({ id: req.params.id });
  }
);

export default storeRouter;
