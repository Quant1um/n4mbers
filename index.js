const express = require("express");
const expressws = require("express-ws");
const url = require("url");
const http = require("http");

const createGameState = require("./state");
const createGameStateInterface = require("./state-interface");

const random = () => {
    let id = Math.random().toString(36).substring(2, 15);
    if(id === "create") return "cr3ate"; //...
    return id;
};

const app = express();
expressws(app);

const games = new Map();

const create = (l) => {
    let id = random();
    while(games.has(id)) {
        id = random();
    }

    let state = createGameState(id, { codeLength: l });
    let iface = createGameStateInterface(state);

    state.on("close", () => {
        games.delete(id);
    });

    games.set(id, iface);
    return id;
};

app.use("/", express.static("html"));

app.get("/create", (req, res) => {
    let digits = req.params.digits || 3;
    if(digits < 1 || digits > 10) {
        res.status(400).end();
        return;
    }

    let id = create(digits);
    res.redirect("../" + id);
});

app.get("/:id", (req, res) => {
    let id = req.params.id;

    if(games.has(id)) {
        res.redirect("../game.html#" + id);
    } else {
        res.status(404).end();
    }
});

app.ws("/socket/:id", (ws, req) => {
    let id = req.params.id || "";
    if (games.has(id)) {
        let wss = games.get(id);
        wss(ws);
    }
});

app.listen(process.env.PORT || 3004);