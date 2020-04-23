const express = require("express");
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
const server = http.createServer(app);
let games = new Map();

const create = (l) => {
    let id = random();
    while(games.has(id)) {
        id = random();
    }

    let state = createGameState(id, { codeLength: l });
    let iface = createGameStateInterface(state);

    state.on("close", () => {
        iface.close();
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

server.on("upgrade", (req, socket, head) => {
    console.log("upgrade request " + head);
    const pathname = url.parse(req.url).pathname;
    if(pathname.startsWith("/")) pathname = pathname.substr(1);
    console.log(pathname);

    if (req.headers["upgrade"] !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
        return;
    }

    if (games.has(pathname)) {
        let wss = games.get(pathname);
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    } else {
        socket.end("HTTP/1.1 404 Not Found");
    }
});

server.listen(process.env.PORT || 3003);