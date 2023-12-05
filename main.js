import { lists } from "./Modules/lists.js";
import { popup, isPopup, togglePopup } from "./Modules/popup.js";

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
const QA = document.getElementById("QA");
const textBox = document.getElementById("text");

export const select = {
    list: document.getElementById("listSelect"),
    q: document.getElementById("questionSelect"),
    a: document.getElementById("answerSelect")
};

export const btn = {
    addList: document.getElementById("addList"),
    clearStorage: document.getElementById("clearStorage"),
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
var isTouch = false;
var isMouse = false;

/**
 * Draws a vertical dash onto the canvas at position (x, y).
 * @param {Number} x The x position of the dash on the canvas
 * @param {Number} y The y position of the dash on the canvas
 */
function verticalDash(x, y) {
    ctx.beginPath();
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x-dash.r, y, dash.r*2, dash.l);
    ctx.arc(x, y+dash.l, dash.r, 0, Math.PI*2);
    ctx.fill();
}

/**
 * Draws a horizontal dash onto the canvas at position (x, y).
 * @param {Number} x The x position of the dash on the canvas
 * @param {Number} y The y position of the dash on the canvas
 */
function horizontalDash(x, y) {
    ctx.beginPath();
    if (!isDarkmode) ctx.fillStyle = "lightgrey";
    else ctx.fillStyle = "#444";
    ctx.arc(x, y, dash.r, 0, Math.PI*2);
    ctx.fillRect(x, y-dash.r, dash.l, dash.r*2);
    ctx.arc(x+dash.l, y, dash.r, 0, Math.PI*2);
    ctx.fill();
}

/**
 * Gets the position of the mouse event on the canvas.
 * @param   {Event} e A mouse event
 * @returns {Object}  The position of the mouse evemt
 */
function getMousePosition(e) {
    let rect = c.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (c.width / rect.width),
        y: (e.clientY - rect.top) * (c.height / rect.height)
    };
}

/**
 * Gets a random index of the selected list of terms based on their weights.
 * @returns {Number} An index of a list
 */
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
    return 0;
}

/**
 * Gets the position of the touch event on the canvas.
 * @param   {Event} e A touch event
 * @returns {Object}  The position of the touch event
 */
function getTouchPosition(e) {
    let touch = e.touches[0] || e.changedTouches[0];
    let rect = c.getBoundingClientRect();
    return {
        x: (touch.pageX - rect.left) * (c.width / rect.width),
        y: (touch.pageY - rect.top) * (c.height / rect.height)
    }
}

/**
 * Clears any user drawn content from the canvas.
 */
function resetCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
    
    for (let x = 0; x < c.width; x += 75) {
        horizontalDash(x, c.height/2);
    }

    for (let y = 0; y < c.height; y += 75) {
        verticalDash(c.width/2, y);
    }

    if (currentElem == "a") textToCanvas(currentList.a[listIndex])
}

/**
 * Adds the answer to the background of the canvas.
 * @param {String} text The answer to the current question 
 */
function textToCanvas(text) {
    ctx.font = "50vmin Arial";
    ctx.fillText(text, 0, 400);
}

/**
 * Adds the properties of a given list as the options for a given select element.
 * @param {HTMLSelectElement} s    A select element
 * @param {Object}            list Either an object of object or an object of lists
 */
export function setSelector(s, list) {
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

/**
 * Toggles the disabled attribute of the buttons w0, w1, w2, and w3.
 */
function toggleWBtns() {
    btn.w0.toggleAttribute("disabled");
    btn.w1.toggleAttribute("disabled");
    btn.w2.toggleAttribute("disabled");
    btn.w3.toggleAttribute("disabled");
}

/**
 * Runs the relevant sequence of code depending on the value of currentElem.
 */
function next() {
    if (currentElem == 'q') {
        currentElem = 'a';
        revealAnswer();
        btn.next.setAttribute("disabled", "");
        toggleWBtns();
    } else {
        if (currentElem == '') btn.next.innerHTML = "Reveal Answer";
        else {
            btn.next.removeAttribute("disabled");
            toggleWBtns();
        }
        currentElem = 'q';
        nextQuestion();
    }
}

/**
 * Loads the next random term.
 */
function nextQuestion() {
    listIndex = getRandomIndex();
    QA.innerHTML = currentList.q[listIndex] + ": ?";
    textBox.value = "";
    resetCanvas();
}

/**
 * Reveals the corresponding answer to the current term.
 */
function revealAnswer() {
    QA.innerHTML = currentList.q[listIndex] + ": " + currentList.a[listIndex];
    textToCanvas(currentList.a[listIndex]);
}

/**
 * Sets up the program to start studying after a list has been selected.
 */
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

/**
 * Loads the weights variable from local storage if it already exists. Otherwise, creates new weights with a base value of 10.
 */
function setWeights() {
    if (localStorage.getItem("Weights") !== null) load();
    else {
        weights = {};
        for (var list in lists) {
            weights[list] = [];
            for (let i = 0; i < Object.values(lists[list])[0].length; i++) {
                weights[list].push(10);
            }
        }
        save();
    }
}

/**
 * Changes the relevant weight based on the user's selection, saves the new weights to local storage, and moves to the next term.
 * @param {Number} w The factor to divide the current weight by
 */
function changeWeights(w) {
    weights[currentStr.list][listIndex] = Math.ceil(weights[currentStr.list][listIndex] / w);
    save();
    next();
}

/**
 * Toggles darkmode for each relevant element.
 */
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

/**
 * Checks if the question and answer select elements have an option selected, and if so, shows the load button.
 */
function everythingSelected() {
    if (select.a.value != "" && select.q.value != "") btn.load.classList.remove("hide");
    else btn.load.classList.add("hide");
}

/**
 * Saves the weights variable to local storage.
 */
function save() {
    localStorage.setItem("Weights", JSON.stringify(weights));
}

/**
 * Gets the weights variable from local storage.
 */
function load() {
    weights = JSON.parse(localStorage.getItem("Weights"));
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

btn.addList.onclick = function() { togglePopup({add:true}); }
btn.clearStorage.onclick = function() { localStorage.removeItem('Weights'); setWeights(); }
btn.load.onclick = function(){ loadList(); }
btn.next.onclick = function(){ next(); };
btn.setList.onclick = function(){ togglePopup({set:true}); }
btn.reset.onclick = function(){ resetCanvas(); }
btn.settings.onclick = function() { togglePopup({settings:true}); }
btn.w0.onclick = function(){ changeWeights(0.5); }
btn.w1.onclick = function(){ changeWeights(1); }
btn.w2.onclick = function(){ changeWeights(2); }
btn.w3.onclick = function(){ changeWeights(4); }