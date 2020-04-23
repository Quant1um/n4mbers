const ws = require("ws");

module.exports = (state) => {
    let server = new ws.Server({ 
        noServer: true,
        perMessageDeflate: false,
        clientTracking: true,
        maxPayload: 512
    });

    const send = (message) => server.clients.forEach((ws) => {
        ws.send(JSON.stringify(message));
    });

    const sendi = (index, message) => server.clients.forEach((ws) => {
        if(ws.gameIndex === index) ws.send(JSON.stringify(message));
    });

    const sendx = (index, message) => server.clients.forEach((ws) => {
        if(ws.gameIndex !== index) ws.send(JSON.stringify(message));
    });

    state.on("turn", (index, result) => {
        sendi(index, { q: "result", v: result });
    });

    state.on("nextTurn", (index) => {
        sendi(index, { q: "turn" });
        sendx(index, { q: "wait" });
    });

    state.on("win", (index) => {
        sendi(index, { q: "win" });
        sendx(index, { q: "lose" });
    });

    state.on("pause", () => send({ q: "pause" }));

    server.on("connection", (ws) => {
        console.log("there is a ws connection");
        ws.once("open", () => {
            let index = state.connect();
            let chatLimit = new Date();

            if(index === false) {
                return ws.terminate();
            }
        
            ws.gameIndex = index;
            ws.isAlive = true;
            ws.on("pong", () => ws.isAlive = true);

            ws.on("message", (data) => {
                let msg = JSON.parse(data);
                if(typeof(msg) === "object") {
                    if(msg.q === "turn") {
                        state.turn(index, msg.v);
                    } else if(msg.q === "chat") {
                        if(new Date() - chatLimit > 500) {
                            msg.v = (msv.v || "").toString();
                            if(msg.v.length > 256) msg.v = msg.v.substring(0, 256);
                            chatLimit = new Date();
                            
                            sendi({ q: "chat", v: msg.v, s: true });
                            sendx({ q: "chat", v: msg.v, s: false });
                        }
                    }
                }
            });

            ws.on("close", () => {
                state.disconnect(ws.gameIndex);
            });

            let playerObj = state.players[index];

            sendi(index, { q: "state", v: {
                turn: state.turn === index,
                asks: playerObj.asks,
                code: playerObj.code,
                name: state.name,
                paused: state.state !== "playing",
                codeLength: state.options.codeLength,
                winner: state.winner !== null ? state.winner === index : null
            }});
        });
    });

    const interval = setInterval(() => {
        server.clients.forEach((ws) => {
            if (!ws.isAlive) return ws.terminate();
        
            ws.isAlive = false;
            ws.ping();
        });
    }, 8000);
    
    server.on("close", () => {
        clearInterval(interval);
    });

    return server;
};