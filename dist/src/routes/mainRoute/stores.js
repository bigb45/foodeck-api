"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../../../db");
const log = console.log;
const storeRouter = express_1.default.Router();
storeRouter.use(express_1.default.json());
// TODO: filter by user location
storeRouter.get("/all", 
/*authenticateJwt,*/ async (req, res) => {
    try {
        const result = await db_1.connection.store.findMany({
            orderBy: { rating: "desc" },
        });
        res.status(200).json(result);
    }
    catch (e) {
        log(e);
        return res.status(500).send("Error: " + e);
    }
});
storeRouter.get("/bento_categories", async (req, res) => {
    try {
        const categories = await db_1.connection.bentoSection.findMany();
        res.status(200).json(categories);
    }
    catch (e) {
        log(e);
        return res.status(500).send("Error: " + e);
    }
});
storeRouter.get(
// get all menus of a store by store id
"/:store_id/menu/all", async (req, res) => {
    try {
        const sections = await db_1.connection.storeSection.findMany({
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
    }
    catch (e) {
        log(e);
        return res.status(500).json({ Error: e });
    }
});
storeRouter.get(
// get store menu by id, returns menu info, isMenuFavorite, menu customization options
"/:store_id/menu/:menu_id", async (req, res) => {
    try {
        const menu = await db_1.connection.storeItem.findUnique({
            where: {
                item_id: req.params.menu_id,
                store: { store_id: { equals: req.params.store_id } },
            },
        });
        res.status(200).json(menu);
    }
    catch (e) {
        log(e);
        return res.status(500).send("Error: " + e);
    }
});
storeRouter.get("/offers", 
/* authenticateJwt, */ async (req, res) => {
    try {
        const offers = await db_1.connection.offer.findMany();
        return res.status(200).json(offers);
    }
    catch (exception) {
        console.log(exception);
        return res.status(500).send("Error: " + exception);
    }
});
// TODO: get data from database
storeRouter.get("/bento_categories/:id", async (req, res) => {
    let users = await db_1.connection.user.findUnique({
        where: { id: req.params.id },
    });
    res.status(200).json(users);
});
storeRouter.get("/:store_id/:menu_id/options", async (req, res) => {
    try {
        const menuOptions = await db_1.connection.optionSection.findMany({
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
    }
    catch (e) {
        log(e.message);
        return res.status(500).send("Error: " + e.message);
    }
});
storeRouter.get("/:id", 
/* authenticateJwt,*/ (req, res) => {
    return res.status(200).send({ id: req.params.id });
});
exports.default = storeRouter;
