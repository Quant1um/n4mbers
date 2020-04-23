
class GameState extends EventTarget {

    constructor() {
        super();
        this.connected = false;
        this.paused = true;
        this.winner = null;
        this.yourTurn = false;
        this.code = null;
        this.name = null;
        this.codeLength = 3;
    }

    init(state) {
        this.connected = true;
        this.paused = state.paused;
        this.winner = state.winner;
        this.yourTurn = state.turn;
        this.code = state.code;
        this.name = state.name;
        this.codeLength = state.codeLength;

        this.dispatchEvent(new CustomEvent("init", { detail: state }));
        
        for(let ask of state.asks) {
            this.handleTurn(ask);
        }

        if(state.winner === true) this.handleWin();
        if(state.winner === false) this.handleLose();

        if(state.turn) this.handleGetControl();
        if(!state.turn) this.handleLoseControl();

        if(state.paused) this.handlePause();
        if(!state.paused) this.handleResume();
    }

    handleDisconnect() {
        this.connected = false;
        this.dispatchEvent(new CustomEvent("disconnect"));
    }

    handleTurn(result) {
        this.dispatchEvent(new CustomEvent("turn", { detail: result }));
    }

    handleChat(message, sender) {
        this.dispatchEvent(new CustomEvent("chat", { detail: { message, sender } }));
    }

    handleWin() {
        this.winner = true;
        this.dispatchEvent(new CustomEvent("win"));
    }

    handleLose() {
        this.winner = false;
        this.dispatchEvent(new CustomEvent("lose"));
    }

    handlePause() {
        this.paused = true;
        this.dispatchEvent(new CustomEvent("pause"));
    }

    handleResume() {
        this.paused = false;
        this.dispatchEvent(new CustomEvent("resume"));
    }

    handleGetControl() {
        this.yourTurn = true;
        this.dispatchEvent(new CustomEvent("take control"));
    }

    handleLoseControl() {
        this.yourTurn = false;
        this.dispatchEvent(new CustomEvent("lose control"));
    }
}

class GameClient extends GameState {

    constructor(addr) {
        super();
        this.createWsClient(addr);
    }

    createWsClient(addr) {
        this.client = new WebSocket(addr);

        this.client.onopen = (e) => console.log("Connection established!");
        this.client.onmessage = (e) => {
            console.log("message: '" + e.data + "'");
            let msg = JSON.parse(e.data);

            if(msg.q === "state") {
                this.init(msg.v);
            } else if(msg.q === "win") {
                this.handleWin();
            } else if(msg.q === "lose") {
                this.handleLose();
            } else if(msg.q === "turn") {
                this.handleGetControl();
            } else if(msg.q === "wait") {
                this.handleLoseControl();
            } else if(msg.q === "result") {
                this.handleTurn(msg.v);
            } else if(msg.q === "pause") {
                this.handlePause();
            } else if(msg.q === "resume") {
                this.handleResume();
            } else if(msg.q === "chat") {
                this.handleChat(msg.v, msg.s);
            }
        };

        this.client.onclose = (e) => {
            this.handleDisconnect();
            setTimeout(() => this.createWsClient(addr), 4000);
        };

        this.client.onerror = (err) => {
            console.error("Socket encountered error: ", err);
            this.client.close();
        };
    }

    send(msg) {
        this.client.send(JSON.stringify(msg));
    }

    turn(code) {
        this.send({ q: "turn", v: code });
    }

    chat(msg) {
        this.send({ q: "chat", v: msg.toString() });
    }
}

window.N4mbers = { createClient: (addr) => new GameClient(addr) };