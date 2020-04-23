const events = require("events")

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

const isValidCode = (code) => {
    let allowedSymbols = { ["0"]: true, ["1"]: true, ["2"]: true, ["3"]: true, ["4"]: true,
    ["5"]: true, ["6"]: true, ["7"]: true, ["8"]: true, ["9"]: true };

    for(let i = 0; i < code.length; i++) {
        if(!allowedSymbols[code[i]]) return false;
        allowedSymbols[code[i]] = false;
    }

    return true;
}

const generateValidCode = (l) => {
    if(l > 10) throw new Error("");
    let s = shuffle([ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ]);
    return s.slice(0, l).join("");
}

class PlayerState {

    constructor(index, code) {
        this.connected = false;
        this.index = index;
        this.code = code;
        this.asks = [];
    }

    ask(code) {
        if(code.length !== this.code.length) throw new Error("length mismatch");

        let matches = 0;
        let exists = 0;

        for(let i = 0; i < code.length; i++) 
        {
            if (code[i] === this.code[i]) matches++;
            else if(this.code.indexOf(code[i]) >= 0) exists++;
        } 

        return [code, matches, exists];
    }
}

class GameState extends events.EventEmitter {
    constructor(name, options = { codeLength: 3 }) {
        if(options.codeLength > 10) throw new Error("codeLength is too big");
        super();
        
        this.name = name;
        this.options = options;
        this.players = [ new PlayerState(0, generateValidCode(options.codeLength)), new PlayerState(1, generateValidCode(options.codeLength)) ]; 

        this.turn = 0;
        this.winner = null;
    }

    turn(index, code) {
        if(this.state !== "playing") return false;
        if(index !== this.turn) return false;
        if(code.length !== this.options.codeLength) return false;
        if(!isValidCode(code)) return false;

        let currentPlayerObj = this.players[index];
        let nextPlayer = (this.turn + 1) % this.players.length;
        let result = this.players[nextPlayer].ask(code);

        currentPlayerObj.asks.push(result);
        this.emit("turn", index, result)

        if(result[1] === code.length) {
            this.winner = currentPlayerObj;
            this.emit("win", index);
        } else {
            this.turn = nextPlayer;
            this.emit("nextTurn", nextPlayer);
        }

        return true;
    }

    connect() {
        if(this.state !== "waiting") return false;

        for(let i = 0; i < this.players.length; i++) {
            if(!this.players[i].connected) {
                this.players[i].connected = true;
                this.emit("connect", i);

                if(this.players.every((p) => p.connected)) this.emit("resume", i);
                return i;
            }
        }

        return false;
    }

    disconnect(index) {
        if(this.players[index] && this.players[index].connected) {
            if(this.players.every((p) => p.connected)) this.emit("pause", index);
            
            this.players[index].connected = false;
            if (this.players.every((p) => !p.connected)) this.emit("close", index);
            this.emit("disconnect", index);
            return true;
        }

        return false;
    }

    get state() {
        if (this.players.every((p) => !p.connected)) return "dead";
        if (this.winner !== null) return "completed";
        if (this.players.every((p) => p.connected)) return "playing";
        return "waiting";
    }
}

module.exports = (name) => new GameState(name);