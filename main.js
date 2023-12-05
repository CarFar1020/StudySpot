import { lists, text } from "./Modules/lists.js";
import { popup, overlay, isPopup, togglePopup } from "./Modules/popup.js";
import { c, textToCanvas, resetCanvas, drawStart, draw } from "./Modules/draw.js";
import { weights, setWeights, changeWeights, toggleWBtns } from "./Modules/weights.js";

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

const slider = {
    darkmode: document.getElementById("darkmodeSlider")
};

export var currentList = {
    list: null,
    a: null,
    q: null
};

export var currentStr = {
    list: null,
    a: null,
    q: null
};

export var listIndex;
export var currentElem = '';

export var isDarkmode = false;
var isMouse = false;

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
 * Adds the properties of a given list as the options for a given select element.
 * @param {HTMLSelectElement} s    A select element
 * @param {Object}            list Either an object of objects or an object of lists
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
 * Runs the relevant sequence of code depending on the value of currentElem.
 */
export function next() {
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
    }
});

overlay.addEventListener("click", e => {
    togglePopup();
});

document.addEventListener("touchstart", e => {
    let pos = getTouchPosition(e);
    drawStart(pos);
});

document.addEventListener("touchmove", e => {
    let pos = getTouchPosition(e);
    draw(pos);
});

document.addEventListener("mousedown", e => {
    let pos = getMousePosition(e);
    drawStart(pos);
    isMouse = true;
});

document.addEventListener("mousemove", e => {
    if (isMouse) {
        let pos = getMousePosition(e);
        draw(pos);
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

slider.darkmode.onchange = function(){ toggleDarkMode(); }