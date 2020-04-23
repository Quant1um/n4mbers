const express = require("express");
const expressws = require("express-ws");

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


app.use("/", express.static("public"));
app.get("/create", (req, res, next) => {
    let digits = Number(req.query.digits || 3);
    if(digits < 1 || digits > 10) {
        next();
        return;
    }

    let id = create(digits);
    res.redirect("../" + id);
});

app.get("/:id", (req, res, next) => {
    let id = req.params.id;

    if(games.has(id)) {
        res.sendFile("game.html", { root: "./public" });
    } else {
        next();
    }
});

app.ws("/socket/:id", (ws, req) => {
    let id = req.params.id || "";
    if (games.has(id)) {
        let wss = games.get(id);
        wss(ws);
    } else {
        ws.terminate();
    }
});

app.get("*", (req, res) => {
    res.sendFile("404.html", { root: "./public" });
});

app.listen(process.env.PORT || 3004);