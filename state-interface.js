module.exports = (state) => {
    let clients = new Map();

    const send = (message) => clients.forEach((ws) => {
        ws.send(JSON.stringify(message));
    });

    const sendi = (index, message) => {
        if(clients.has(index)) 
            clients.get(index).send(JSON.stringify(message));
    };

    const sendx = (index, message) => clients.forEach((ws) => {
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
    state.on("resume", () => send({ q: "resume" }));

    return (ws) => {
        const heartbeat = () => ws.isAlive = true;

        const timeout = setInterval(() => {
            if(ws.isAlive) {
                ws.isAlive = false;
                ws.ping();
            } else ws.terminate();
        }, 8000);

        let index = state.connect();
        let chatLimit = new Date();

        if(index === false) {
            return ws.terminate();
        }
    
        clients.set(index, ws);
        ws.gameIndex = index;

        heartbeat();
        ws.on("pong", heartbeat);
        ws.on("message", (data) => {
            let msg = JSON.parse(data);
            if(typeof(msg) === "object") {
                if(msg.q === "turn") {
                    state.turn(index, msg.v);
                } else if(msg.q === "chat") {
                    if(new Date() - chatLimit > 500) {
                        msg.v = (msg.v || "").toString();
                        if(msg.v.length > 256) msg.v = msg.v.substring(0, 256);
                        chatLimit = new Date();
                        
                        sendi(index, { q: "chat", v: msg.v, s: true });
                        sendx(index, { q: "chat", v: msg.v, s: false });
                    }
                }
            }
        });

        ws.on("close", () => {
            clients.delete(index);
            state.disconnect(ws.gameIndex);
            clearInterval(timeout);
        });

        let playerObj = state.players[index];
        sendi(index, { q: "state", v: {
            turn: state.turnIndex === index,
            asks: playerObj.asks,
            code: playerObj.code,
            name: state.name,
            paused: state.state !== "playing",
            codeLength: state.options.codeLength,
            winner: state.winner !== null ? state.winner === index : null
        }});
    };
};