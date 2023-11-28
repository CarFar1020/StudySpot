import { lists } from "./Modules/lists.js";

const text = {
    alphabet: "Alphabet",
    APkanji: "AP Kanji",
    hiragana: "Hiragana",
    japanese: "Japanese",
    kanji: "Kanji",
    katakana: "Katakana",
    meaning: "Meaning",
    romaji: "Romaji"
};

const c = document.getElementById("canvas");
const ctx = c.getContext('2d');

const body = document.getElementById("body");
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const QA = document.getElementById("QA");
const textBox = document.getElementById("text");

const select = {
    list: document.getElementById("listSelect"),
    q: document.getElementById("questionSelect"),
    a: document.getElementById("answerSelect")
};

const btn = {
    addList: document.getElementById("addList"),
    load: document.getElementById("loadList"),
    next: document.getElementById("next"),
    setList: document.getElementById("setList"),
    reset: document.getElementById("reset"),
    settings: document.getElementById("settings"),
    w0: document.getElementById("w0"),
    w1: document.getElementById("w1"),
    w2: document.getElementById("w2"),
    w3: document.getElementById("w3")
};

const buffers = {
    addList: document.getElementById("addListB"),
    setList: document.getElementById("setListB"),
    settings: document.getElementById("settingsB")
};

const dash = {
    r: 5,
    l: 50
};

var currentList = {
    list: null,
    a: null,
    q: null
};
var currentStr = {
    list: null,
    a: null,
    q: null
};

var listIndex;
var currentElem = '';

var weights = {};

var isDarkmode = false;
var isPopup = false;
var isSetList = false;
var isSettings = false;
var isAddList = false;

var isTouch = false;
var isMouse = false;

function verticalDash(x, y) {
    ctx.beginPath();
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x-dash.r, y, dash.r*2, dash.l);
    ctx.arc(x, y+dash.l, dash.r, 0, Math.PI*2);
    ctx.fill();
}

function horizontalDash(x, y) {
    ctx.beginPath();
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x, y-dash.r, dash.l, dash.r*2);
    ctx.arc(x+dash.l, y, dash.r, 0, Math.PI*2);
    ctx.fill();
}

function getMousePosition(e) {
    let rect = c.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (c.width / rect.width),
        y: (e.clientY - rect.top) * (c.height / rect.height)
    };
}

function getRandomIndex() {
    let pool = 0;
    weights[currentStr.list].forEach(weight => {
        pool += weight;
    });
    let chosenIndex = Math.floor(Math.random()*pool);
    for (let wi = 0; wi < weights[currentStr.list].length; wi++) {
        for (let i = 0; i < weights[currentStr.list][wi]; i++) {
            if (chosenIndex == i) return wi;
        }
        chosenIndex -= weights[currentStr.list][wi];
    }
}

function getTouchPosition(e) {
    let touch = e.touches[0] || e.changedTouches[0];
    let rect = c.getBoundingClientRect();
    return {
        x: (touch.pageX - rect.left) * (c.width / rect.width),
        y: (touch.pageY - rect.top) * (c.height / rect.height)
    }
}

function resetCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
    
    for (let x = 0; x < c.width; x += 75) {
        horizontalDash(x, c.height/2);
    }

    for (let y = 0; y < c.height; y += 75) {
        verticalDash(c.width/2, y);
    }
}

function setSelector(s, list) {
    s.classList.remove("hide");
    while (s.childElementCount > 1) {
        s.removeChild(s.lastChild);
    }

    for (var obj in list) {
        let option = document.createElement("option");
        let node = document.createTextNode(text[obj]);
        option.value = obj;
        option.appendChild(node);
        s.appendChild(option);
    }
}

function enableWBtns() {
    btn.w0.removeAttribute("disabled");
    btn.w1.removeAttribute("disabled");
    btn.w2.removeAttribute("disabled");
    btn.w3.removeAttribute("disabled");
}

function disableWBtns() {
    btn.w0.setAttribute("disabled", "");
    btn.w1.setAttribute("disabled", "");
    btn.w2.setAttribute("disabled", "");
    btn.w3.setAttribute("disabled", "");
}

function next() {
    if (currentElem == 'q') {
        currentElem = 'a';
        revealAnswer();
        enableWBtns();
        btn.next.setAttribute("disabled", "");
    } else {
        if (currentElem == '') btn.next.innerHTML = "Reveal Answer";
        else btn.next.removeAttribute("disabled");
        currentElem = 'q';
        nextQuestion();
        disableWBtns();
    }
}

function nextQuestion() {
    listIndex = getRandomIndex();
    QA.innerHTML = currentList.q[listIndex] + ": ?";
    textBox.value = "";
    resetCanvas();
}

function revealAnswer() {
    QA.innerHTML = currentList.q[listIndex] + ": " + currentList.a[listIndex];
}

function loadList() {
    for (let s in select) {
        currentStr[s] = select[s].value;
    }
    currentList.list = lists[currentStr.list];
    currentList.q = currentList.list[currentStr.q];
    currentList.a = currentList.list[currentStr.a];

    btn.next.removeAttribute("disabled");
    btn.next.innerHTML = "Start";

    QA.innerHTML = "New List: " + text[currentStr.list] + " - " + text[currentStr.q] + " to " + text[currentStr.a];
    togglePopup();
}

function setWeights() {
    if (localStorage.getItem("Weights") !== null) load();
    else {
        for (var list in lists) {
            weights[list] = [];
            for (let i = 0; i < Object.values(lists[list])[0].length; i++) {
                weights[list].push(10);
            }
        }
        save();
    }
}

function changeWeights(w) {
    weights[currentStr.list][listIndex] = Math.ceil(weights[currentStr.list][listIndex] / w);
    save();
    next();
}

function togglePopup() {
    popup.classList.toggle("hide");
    overlay.classList.toggle("hide");
    if (isPopup) {
        isPopup = false;
        if (isSetList) {
            isSetList = false;
            buffers.setList.classList.add("hide");
            for (let s in select) select[s].classList.add("hide");
            btn.load.classList.add("hide");
        } else if (isSettings) {
            isSettings = false;
            buffers.settings.classList.add("hide");
        } else if (isAddList) {
            isAddList = false;
            buffers.addList.classList.add("hide");
        }
    } else isPopup = true;
}

function toggleDarkMode() {
    var elems = [body, popup, c, textBox];

    for (let b in btn) {
        elems.push(btn[b]);
    }

    for (let s in select) {
        elems.push(select[s]);
    }

    elems.forEach(elem => {
        elem.classList.toggle("darkmode");
    });
    if (isDarkmode) isDarkmode = false;
    else isDarkmode = true;
    resetCanvas()
}

function setList() {
    togglePopup();
    isSetList = true;
    buffers.setList.classList.remove("hide");
    setSelector(select.list, lists);
}

function settings() {
    togglePopup();
    isSettings = true;
    buffers.settings.classList.remove("hide");
}

function addList() {
    togglePopup();
    isAddList = true;
    buffers.addList.classList.remove("hide");
}

function everythingSelected() {
    if (select.a.value != "" && select.q.value != "") btn.load.classList.remove("hide");
    else btn.load.classList.add("hide");
}

function save() {
    localStorage.setItem("Weights", JSON.stringify(weights));
}

function load() {
    try {
        weights = JSON.parse(localStorage.getItem("Weights"));
    } catch {
        localStorage.removeItem("Weights");
        setWeights();
    }
}

resetCanvas();
setWeights();

document.addEventListener("keydown", e => {
    switch (e.key) {
        case "Escape":
            if (isPopup) togglePopup();
            break;
        case "Enter":
            if (currentList.a != null) next();
            break;
        case "ArrowDown":
            toggleDarkMode();
            break;
    }
});

document.addEventListener("touchstart", e => {
    let pos = getTouchPosition(e);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    if (!isDarkmode) ctx.strokeStyle = "black";
    else ctx.strokeStyle = "white";
    ctx.moveTo(pos.x, pos.y);
    isTouch = true;
});

document.addEventListener("touchmove", e => {
    if (isTouch) {
        let pos = getTouchPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
});

document.addEventListener("touchend", e => {
    isTouch = false
});

document.addEventListener("mousedown", e => {
    let pos = getMousePosition(e);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    if (!isDarkmode) ctx.strokeStyle = "black";
    else ctx.strokeStyle = "white";
    ctx.moveTo(pos.x, pos.y);
    isMouse = true;
});

document.addEventListener("mousemove", e => {
    if (isMouse) {
        let pos = getMousePosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
});

document.addEventListener("mouseup", e => {
    isMouse = false
});

select.list.addEventListener("change", e => {
    setSelector(select.q, lists[select.list.value]);
    setSelector(select.a, lists[select.list.value]);
    btn.load.classList.add("hide");
});

select.q.onchange = function(){ everythingSelected(); }
select.a.onchange = function(){ everythingSelected(); }

btn.addList.onclick = function() { addList(); };
btn.load.onclick = function(){ loadList(); }
btn.next.onclick = function(){ next(); };
btn.setList.onclick = function(){ setList(); }
btn.reset.onclick = function(){ resetCanvas(); }
btn.settings.onclick = function() { settings(); }
btn.w0.onclick = function(){ changeWeights(0.5); }
btn.w1.onclick = function(){ changeWeights(1); }
btn.w2.onclick = function(){ changeWeights(2); }
btn.w3.onclick = function(){ changeWeights(4); }