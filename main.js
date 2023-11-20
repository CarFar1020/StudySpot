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
    subject: document.getElementById("subjectSelect"),
    list: document.getElementById("listSelect"),
    q: document.getElementById("questionSelect"),
    a: document.getElementById("answerSelect")
};

const btn = {
    load: document.getElementById("loadList"),
    next: document.getElementById("next"),
    reset: document.getElementById("reset"),
    w0: document.getElementById("w0"),
    w1: document.getElementById("w1"),
    w2: document.getElementById("w2"),
    w3: document.getElementById("w3")
};

const dash = {
    r: 5,
    l: 50
};

var currentList = {
    subject: null,
    list: null,
    a: null,
    q: null
};
var currentStr = {
    subject: null,
    list: null,
    a: null,
    q: null
};

var listIndex;
var currentElem = '';

var weights = {};
var darkmode = false;

function verticalDash(x, y) {
    ctx.beginPath();
    ctx.fillStyle = "lightgrey";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x-dash.r, y, dash.r*2, dash.l);
    ctx.arc(x, y+dash.l, dash.r, 0, Math.PI*2);
    ctx.fill();
}

function horizontalDash(x, y) {
    ctx.beginPath();
    ctx.fillStyle = "lightgrey";
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
    weights[currentStr.subject][currentStr.list].forEach(weight => {
        pool += weight;
    });
    let chosenIndex = Math.floor(Math.random()*pool);
    for (let wi = 0; wi < weights[currentStr.subject][currentStr.list].length; wi++) {
        for (let i = 0; i < weights[currentStr.subject][currentStr.list][wi]; i++) {
            if (chosenIndex == i) return wi;
        }
        chosenIndex -= weights[currentStr.subject][currentStr.list][wi];
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
    currentList.subject = lists[currentStr.subject];
    currentList.list = currentList.subject[currentStr.list];
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
        for (var subject in lists) {
            weights[subject] = {};
            for (var list in lists[subject]) {
                weights[subject][list] = [];
                for (let i = 0; i < Object.values(lists[subject][list])[0].length; i++) {
                    weights[subject][list].push(10);
                }
            }
        }
        save();
    }
}

function changeWeights(w) {
    weights[currentStr.subject][currentStr.list][listIndex] = Math.ceil(weights[currentStr.subject][currentStr.list][listIndex] / w);
    save();
    next();
}

function togglePopup() {
    popup.classList.toggle("hide");
    overlay.classList.toggle("hide");
}

function toggleDarkMode() {
    var elems = [body, popup, c];

    for (let b in btn) {
        elems.push(btn[b]);
    }

    for (let s in select) {
        elems.push(select[s]);
    }

    elems.forEach(elem => {
        elem.classList.toggle("darkmode");
    });
    if (darkmode) darkmode = false;
    else darkmode = true;
}

function everythingSelected() {
    if (select.a.value != "" && select.q.value != "") btn.load.classList.remove("hide");
    else btn.load.classList.add("hide");
}

function save() {
    localStorage.setItem("Weights", JSON.stringify(weights));
}

function load() {
    weights = JSON.parse(localStorage.getItem("Weights"));
}

setSelector(select.subject, lists);
resetCanvas();
setWeights();
load();
toggleDarkMode();

document.addEventListener("keydown", e => {
    switch (e.key) {
        case "Enter":
            if (currentList.a != null) next();
            break;
        case "ArrowUp":
            togglePopup();
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
    ctx.fillStyle = "black";
    ctx.moveTo(pos.x, pos.y);
});

document.addEventListener("touchmove", e => {
    let pos = getTouchPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

select.subject.addEventListener("change", e => {
    setSelector(select.list, lists[select.subject.value]);
    everythingSelected();
});

select.list.addEventListener("change", e => {
    setSelector(select.q, lists[select.subject.value][select.list.value]);
    setSelector(select.a, lists[select.subject.value][select.list.value]);
    everythingSelected();
});

select.q.onchange = function(){ everythingSelected(); }
select.a.onchange = function(){ everythingSelected(); }

btn.load.onclick = function(){ loadList(); }
btn.next.onclick = function(){ next(); };
btn.reset.onclick = function(){ resetCanvas(); }
btn.w0.onclick = function(){ changeWeights(0.5); }
btn.w1.onclick = function(){ changeWeights(1); }
btn.w2.onclick = function(){ changeWeights(2); }
btn.w3.onclick = function(){ changeWeights(4); }