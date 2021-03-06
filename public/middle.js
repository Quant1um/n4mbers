$(() => {
    const name = () => {
        let h = window.location.pathname;
        if (h.startsWith("/")) h = h.substring(1);
        return h;
    }

    let secure = location.protocol === "https:";
    let client = N4mbers.createClient((secure ? "wss://" : "ws://") + window.location.host + "/socket/" + name());
    let ui = N4mbersUi;

    ui.addEventListener("guess", (e) => {
        if(!client.connected || !client.yourTurn) {
            return e.preventDefault();
        }

        client.turn(e.detail);
    });
    
    ui.addEventListener("chat", (e) => {
        if(!client.connected) {
            return e.preventDefault();
        }

        client.chat(e.detail);
    });

    client.addEventListener("init", (e) => {
        ui.clearGuesses();
        ui.setCode(client.code);
        ui.setCodeLength(client.codeLength);

        ui.setOverlayEnabled(ui.overlays.connection, false);
        ui.setOverlayEnabled(ui.overlays.waiting, false);
        ui.setOverlayEnabled(ui.overlays.win, false);
        ui.setOverlayEnabled(ui.overlays.lose, false);
    });

    client.addEventListener("chat", (e) => {
        ui.addChat(e.detail.sender ? "You: " : "Opponent: ", e.detail.message);
    });

    client.addEventListener("turn", (e) => {
        let r = e.detail;
        ui.addGuess(r[0], r[1], client.codeLength > 9 ? 0 : r[2]);
    });

    client.addEventListener("take control", () => {
        ui.setTurnTooltip(true);
    });

    client.addEventListener("lose control", () => {
        ui.setTurnTooltip(false);
    });

    client.addEventListener("win", () => {
        ui.setOverlayEnabled(ui.overlays.win, true);
    });

    client.addEventListener("lose", () => {
        ui.setOverlayEnabled(ui.overlays.lose, true);
    });

    client.addEventListener("disconnect", () => {
        ui.setOverlayEnabled(ui.overlays.connection, true);
    });

    client.addEventListener("pause", () => {
        ui.setOverlayEnabled(ui.overlays.waiting, true);
    });

    client.addEventListener("resume", () => {
        ui.setOverlayEnabled(ui.overlays.waiting, false);
    });

    ui.setOverlayEnabled(ui.overlays.connection, true);
    ui.setInviteLink(window.location);
});