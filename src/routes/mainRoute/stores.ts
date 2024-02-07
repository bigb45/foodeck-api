import express, { Request, Response } from "express";
import { connection } from "../../../db";
import { authenticateJwt } from "../../middleware/middleware.js";
import { Store } from "@prisma/client";
import { randomUUID } from "crypto";
import { create } from "domain";

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
  try {
    const categories = await connection.bentoSection.findMany({
      orderBy: { title: "desc" },
    });
    res.status(200).json(categories);
  } catch (e) {
    log(e);
    return res.status(500).send("Error: " + e);
  }
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
    log(
      `getting meal info for ${req.params.menu_id}, in store ${req.params.store_id}`
    );
    try {
      const menu = await connection.storeItem.findUnique({
        include: {
          store: {
            select: {
              store_name: true,
              address: true,
            },
          },
        },
        where: {
          item_id: req.params.menu_id,
          store: { store_id: { equals: req.params.store_id } },
        },
      });
      // if (menu && menu.store) {
      const flattenedMenu = {
        ...menu.store,
        ...menu,
        store: undefined, // this removes the store
      };
      res.status(200).json(flattenedMenu);
      // }
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
  /* authenticateJwt,*/ async (req, res) => {
    log("request made");
    try {
      const store = await connection.store.findUnique({
        where: {
          store_id: req.params.id,
        },
      });
      return res.status(200).json(store);
    } catch (e) {
      log(e);
      return res.status(500).send("Error: " + e);
    }
  }
);

// region: Store Post Requests

storeRouter.post("/add_store", async (req, res) => {
  log("request: ", req.body);
  try {
    const store: Store = await connection.store.create({
      data: {
        store_id: randomUUID(),
        store_name: req.body.store_name,
        address: req.body.address,
        delivery_time: req.body.delivery_time,
        phone: req.body.phone,
        cover_image_url: req.body.cover_image_url || "",
        rating: req.body.rating || 0,
        // Section: [],
        // StoreItem: [],
      },
    });
    return res.status(200).json(store);
  } catch (e) {
    log(e);
    return res.status(500).send("Error: " + e);
  }
});

storeRouter.post("/add_section", async (req, res) => {
  log("adding section: ", req.body.section_title);
  try {
    const section = await connection.storeSection.create({
      data: {
        section_id: randomUUID(),
        section_title: req.body.section_title,
        store_id: req.body.store_id,
      },
    });
    return res.status(200).json(section);
  } catch (e) {
    log(e);
    return res.status(500).send("Error: " + e);
  }
});

storeRouter.post("/add_menu", async (req, res) => {
  log("adding menu: ", req.body.menu_name);
  try {
    const menu = await connection.storeItem.create({
      data: {
        item_id: randomUUID(),
        store_item_section_id: req.body.section_id,
        item_name: req.body.menu_name,
        description: req.body.description,
        price: req.body.price,
        cover_image_url: req.body.image_url,
        store_id: req.body.restaurant_id,
      },
    });
    return res.status(200).json(menu);
  } catch (e) {
    log(e);
    return res.status(500).send("Error: " + e);
  }
});
// endRegion

export default storeRouter;
