
$(() => {
    const codeText =  $("#info-code");
    const guesses =  $("#info-guesses");
    const chat = $("#info-chat");
    const guessInput = $("#guess-input");
    const guessButton = $("#guess-button");
    const chatInput = $("#chat-input");
    const chatButton = $("#chat-button");
    const inviteLink = $("#link");
    const tooltipTurn = $("#tooltip-turn");

    const ui = new EventTarget();

    let codeLength = 3;

    const isValidCode = (code) => {
        if(code.length > codeLength) return false;
        let allowedSymbols = { ["0"]: true, ["1"]: true, ["2"]: true, ["3"]: true, ["4"]: true,
                               ["5"]: true, ["6"]: true, ["7"]: true, ["8"]: true, ["9"]: true };

        for(let i = 0; i < code.length; i++) {
            if(!allowedSymbols[code[i]]) return false;
            allowedSymbols[code[i]] = false;
        }

        return true;
    };

    const placeCaretAtEnd = (el) => {
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            let range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            let textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    };
    
    const forceGuess = (val) => {
        if(ui.dispatchEvent(new CustomEvent("guess", { 
            detail: val || guessInput.val(),
            cancelable: true
        }))) {
            if(!val) guessInput.val("")
        }
    };

    const forceChat = (val) => {
        if(ui.dispatchEvent(new CustomEvent("chat", { 
            detail: val || chatInput.val(),
            cancelable: true
        }))) {
            if(!val) chatInput.val("")
        }
    };

    guessInput.on("input", (e) => {
        let str = guessInput.val();
        while(str.length > 0) {
            if(!isValidCode(str)) {
                str = str.substring(0, str.length - 1);    
            } else break;
        }

        if(str != guessInput.val()) {
            guessInput.val(str);
            placeCaretAtEnd(guessInput[0]);
        }
    });

    guessInput.keypress((e) => {
        if(e.key === "Enter") {
            forceGuess();
        } else if(e.key < '0' || e.key > '9') e.preventDefault();
    });

    chatInput.keypress((e) => {
        if(e.key === "Enter") {
            forceChat();
        }
    });

    ui.addEventListener("guess", (e) => {
        if(typeof e.detail !== "string" || e.detail.length !== codeLength) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    });

    guessButton.click(() => forceGuess());
    chatButton.click(() => forceChat());

    const setCode = (code) => codeText.text(code);
    const setCodeLength = (l) => codeLength = l;

    const addGuess = (code, plus, minus) => {
        let elem = $("<div></div>");
        let codeElem = $("<span></span>").text(code);
        let resultElem = $("<span class='result'></span>");

        for(let i = 0; i < plus; i++) {
            $("<span class='inverted'>+</span>").appendTo(resultElem);
        }

        for(let i = 0; i < minus; i++) {
            $("<span class='inverted'>-</span>").appendTo(resultElem);
        }

        codeElem.appendTo(elem);
        resultElem.appendTo(elem);

        let target = guesses[0].scrollHeight - guesses[0].clientHeight;
        let bottom = guesses.scrollTop() >= target - 1;

        elem.appendTo(guesses);

        if(bottom) guesses.scrollTop(guesses[0].scrollHeight - guesses[0].clientHeight);
    };

    const addChat = (prefix, message) => {
        let target = chat[0].scrollHeight - chat[0].clientHeight;
        let bottom = chat.scrollTop() >= target - 1;

        let elem = $("<div></div>").text(message.toString());
        if(prefix !== null) $("<span class='sub'></span>").text(prefix).prependTo(elem);
        elem.appendTo(chat);
        
        if(bottom) chat.scrollTop(chat[0].scrollHeight - chat[0].clientHeight);
    };

    const clearGuesses = () => guesses.empty();
    const clearChat = () => chat.empty();

    const setTurnTooltip = (s) => tooltipTurn.toggleClass("forced", s);
    const setInviteLink = (s) => inviteLink.text(s);

    const copyToClipboard = (str) => {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(str).select();
        document.execCommand("copy");
        $temp.remove();
    };

    $(".copy-on-click").click((e) => copyToClipboard(e.target.innerText));

    const overlays = [ $("#overlay-waiting"), $("#overlay-connection"), $("#overlay-lose"), $("#overlay-win") ];
    const overlayEnabled = [ false, false, false, false ];

    const isOverlayEnabled = (idx) => overlayEnabled[idx];
    const setOverlayEnabled = (idx, s) => {
        if(idx < 0 || idx > overlays.length) return;

        overlayEnabled[idx] = s;

        let lastEnabled = -1;
        for(let i = overlays.length - 1; i >= 0; i--) {
            if(overlayEnabled[i]) {
                lastEnabled = i;
                break;
            }
        }

        for(let i = 0; i < overlays.length; i++) {
            overlays[i].toggleClass("shown", i === lastEnabled);
        }
    };

    window.N4mbersUi = Object.assign(ui, {
        setCode, 
        addGuess, addChat, 
        clearChat, clearGuesses,

        setCodeLength,
        setInviteLink,
        setTurnTooltip,

        isOverlayEnabled,
        setOverlayEnabled,

        overlays: {
            waiting: 0,
            connection: 1,
            lose: 2,
            win: 3
        }
    });
});